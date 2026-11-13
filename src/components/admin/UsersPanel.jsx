import { useEffect, useState } from 'react';
import { Loader2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { inputClass } from '@/components/admin/RecordForm';

const th = 'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-steel';

export default function UsersPanel({ me }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    base44.entities.User.list('-created_date', 500)
      .then((rows) => setUsers(rows || []))
      .catch((err) => setNotice(`Could not load users: ${err?.message || err}`))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const invite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await base44.users.inviteUser(email.trim(), role);
      setNotice(`Invitation sent to ${email.trim()} as ${role}.`);
      setEmail('');
      await load();
    } catch (err) {
      setNotice(`Invite failed: ${err?.message || err}`);
    }
    setBusy(false);
  };

  const changeRole = async (user, next) => {
    if (user.id === me?.id && next !== 'admin') {
      setNotice("You can't remove your own admin access.");
      return;
    }
    try {
      await base44.entities.User.update(user.id, { role: next });
      setUsers((list) => list.map((u) => (u.id === user.id ? { ...u, role: next } : u)));
      setNotice(`${user.full_name || user.email} is now ${next === 'admin' ? 'an admin' : 'a collector (user)'}.`);
    } catch (err) {
      setNotice(`Could not change role: ${err?.message || err}`);
    }
  };

  return (
    <div>
      <form onSubmit={invite} className="flex flex-col gap-2 rounded-[10px] border border-hair bg-white p-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-[12px] font-medium text-steel">
          Invite someone to sign in
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={inputClass} />
        </label>
        <label className="block text-[12px] font-medium text-steel">
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClass} sm:w-44`}>
            <option value="user">Collector (user)</option>
            <option value="admin">Admin (can edit)</option>
          </select>
        </label>
        <button type="submit" disabled={busy} className="flex h-10 items-center justify-center gap-2 rounded-lg bg-oxblood px-4 text-sm font-semibold text-white hover:bg-oxblood-dark disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Send invite
        </button>
      </form>

      {notice && <p className="mt-3 rounded bg-navy/5 px-3 py-2 text-[13px] text-navy">{notice}</p>}

      <div className="mt-4 overflow-x-auto rounded-[10px] border border-hair bg-white">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-frost/70">
              <th className={th}>Name</th>
              <th className={th}>Email</th>
              <th className={th}>Role</th>
              <th className={th}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="px-3 py-10 text-center text-steel">Loading…</td></tr>}
            {!loading && users.map((u) => (
              <tr key={u.id} className="border-t border-hair/70">
                <td className="px-3 py-2 font-medium text-ink">{u.full_name || '—'}{u.id === me?.id && <span className="ml-2 text-[11px] text-steel">(you)</span>}</td>
                <td className="px-3 py-2 text-steel">{u.email}</td>
                <td className="px-3 py-2">
                  <select value={u.role || 'user'} onChange={(e) => changeRole(u, e.target.value)} className={`${inputClass} mt-0 h-9 w-auto text-[13px]`}>
                    <option value="user">Collector (user)</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-3 py-2 text-steel">{u.created_date ? new Date(u.created_date).toLocaleDateString() : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] text-steel">Only admins can add, edit or delete records. Collectors can sign in but only see the public site.</p>
    </div>
  );
}
