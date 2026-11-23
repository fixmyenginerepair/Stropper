import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link2, Pencil, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import RecordForm, { inputClass } from '@/components/admin/RecordForm';
import { ADMIN_ENTITIES } from '@/lib/adminConfig';

// Collectors table: role (Admin / Collector), approval, linked sign-in account, add / edit / delete.
const th = 'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-steel';
const ROLE_CHOICES = [
  { value: 'user', label: 'Collector' },
  { value: 'admin', label: 'Admin' },
];
const norm = (s) => String(s || '').trim().toLowerCase();
const nameKey = (s) => norm(s).replace(/[^a-z]/g, '');

export default function CollectorsPanel({ me }) {
  const config = ADMIN_ENTITIES.Collector;
  const [rows, setRows] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState({ open: false, record: null, mode: 'create' });

  const load = useCallback(async () => {
    try {
      const [c, u] = await Promise.all([base44.entities.Collector.list('name', 1000), base44.entities.User.list('-created_date', 1000)]);
      setRows(c || []);
      setUsers(u || []);
    } catch (err) {
      setNotice(`Could not load collectors: ${err?.message || err}`);
      setRows([]);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    if (!rows) return [];
    const byId = Object.fromEntries(users.map((u) => [u.id, u]));
    const byEmail = Object.fromEntries(users.map((u) => [norm(u.email), u]));
    const count = {};
    for (const r of rows) {
      for (const k of new Set([nameKey(r.name) && `n:${nameKey(r.name)}`, norm(r.email) && `e:${norm(r.email)}`])) if (k) count[k] = (count[k] || 0) + 1;
    }
    return rows.map((r) => {
      const account = r.user_id ? byId[r.user_id] : null;
      return {
        ...r,
        account,
        signedUp: !account && r.email ? byEmail[norm(r.email)] : null, // has an account that isn't linked yet
        role: account?.role === 'admin' ? 'admin' : 'user',
        self: account?.id === me?.id,
        dup: count[`n:${nameKey(r.name)}`] > 1 || (!!norm(r.email) && count[`e:${norm(r.email)}`] > 1),
      };
    });
  }, [rows, users, me]);

  if (!rows) return <p className="py-10 text-center text-steel">Loading collectors…</p>;

  const shown = list.filter((r) => {
    if (filter === 'admin' && r.role !== 'admin') return false;
    if (filter === 'user' && r.role !== 'user') return false;
    if (filter === 'pending' && r.approved) return false;
    if (filter === 'dup' && !r.dup) return false;
    if (filter === 'linked' && !r.account) return false;
    return !q || `${r.name} ${r.email || ''} ${r.country || ''} ${r.account?.email || ''}`.toLowerCase().includes(q.toLowerCase());
  });

  const run = async (fn, ok) => {
    try {
      await fn();
      setNotice(ok);
      await load();
    } catch (err) {
      setNotice(err?.message || String(err));
    }
  };

  const changeRole = (r, next) => {
    if (!r.account) return;
    if (r.self && next !== 'admin') return setNotice("You can't remove your own admin access.");
    if (next === 'admin' && !window.confirm(`Make ${r.name} an Admin? Admins can add, edit and delete everything on Stropper.com, and print the book.`)) return;
    run(() => base44.entities.User.update(r.account.id, { role: next }), `${r.name} is now ${next === 'admin' ? 'an Admin' : 'a Collector'}.`);
  };

  const remove = (r) => {
    const extra = r.account ? ` Their sign-in account (${r.account.email}) stays.` : '';
    if (!window.confirm(`Delete the collector listing for ${r.name}?${extra}`)) return;
    setEditor((e) => ({ ...e, open: false }));
    run(() => base44.entities.Collector.delete(r.id), `Deleted ${r.name}.`);
  };

  const link = (r) => run(() => base44.entities.Collector.update(r.id, { user_id: r.signedUp.id }), `Linked ${r.name} to ${r.signedUp.email}.`);
  const unlink = (r) => {
    if (r.self) return setNotice("You can't unlink your own account.");
    if (!window.confirm(`Unlink ${r.account.email} from ${r.name}? Their account stays; it just won't control this listing.`)) return;
    run(() => base44.entities.Collector.update(r.id, { user_id: null }), `Unlinked ${r.name}.`);
  };

  const dupCount = list.filter((r) => r.dup).length;
  const pendingCount = list.filter((r) => !r.approved).length;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find by name, email or country" className={`${inputClass} mt-0 sm:max-w-xs`} />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputClass} mt-0 sm:w-56`}>
          <option value="">All collectors</option>
          <option value="admin">Admins</option>
          <option value="user">Collectors</option>
          <option value="linked">Signed up (linked account)</option>
          <option value="pending">Awaiting approval ({pendingCount})</option>
          <option value="dup">Possible duplicates ({dupCount})</option>
        </select>
        <span className="text-[13px] text-steel">{shown.length} of {list.length}</span>
        <button
          onClick={() => setEditor({ open: true, record: null, mode: 'create' })}
          className="flex h-10 items-center gap-2 rounded-lg bg-oxblood px-4 text-sm font-semibold text-white hover:bg-oxblood-dark sm:ml-auto"
        >
          <Plus className="h-4 w-4" /> Add collector
        </button>
      </div>

      {notice && <p className="mt-3 rounded bg-navy/5 px-3 py-2 text-[13px] text-navy">{notice}</p>}

      <div className="mt-4 overflow-x-auto rounded-[10px] border border-hair bg-white">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-frost/70">
              <th className={th}>Name</th>
              <th className={th}>Collects</th>
              <th className={th}>Role</th>
              <th className={th}>Approved</th>
              <th className={th}>Account</th>
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-hair/70 align-top">
                <td className="px-3 py-2">
                  <Link to={`/collectors/${r.id}`} className="font-medium text-ink hover:text-oxblood">{r.name}</Link>
                  <div className="text-[12px] text-steel">
                    {r.email || <span className="italic">no email</span>}
                    {r.country ? ` · ${r.country}` : ''}
                    {r.dup && <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">possible duplicate</span>}
                  </div>
                </td>
                <td className="px-3 py-2 text-steel">{r.collection_type || '—'}</td>
                <td className="px-3 py-2">
                  <select
                    value={r.role}
                    disabled={!r.account || r.self}
                    title={!r.account ? 'Link a sign-in account to change the role' : r.self ? "You can't change your own role" : 'Change role'}
                    onChange={(e) => changeRole(r, e.target.value)}
                    className={`h-8 rounded-md border border-hair px-2 text-[12.5px] font-semibold disabled:opacity-60 ${r.role === 'admin' ? 'bg-navy text-white' : 'bg-frost text-ink'}`}
                  >
                    {ROLE_CHOICES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!r.approved}
                    title="Show in the public directory"
                    onChange={() => run(() => base44.entities.Collector.update(r.id, { approved: !r.approved }), `${r.name} ${r.approved ? 'hidden from' : 'shown in'} the directory.`)}
                  />
                </td>
                <td className="px-3 py-2 text-[12.5px]">
                  {r.account ? (
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-700">{r.account.email}</span>
                      {!r.self && <button onClick={() => unlink(r)} className="text-steel underline hover:text-oxblood">unlink</button>}
                    </span>
                  ) : r.signedUp ? (
                    <button onClick={() => link(r)} className="flex items-center gap-1 text-oxblood underline">
                      <Link2 className="h-3.5 w-3.5" /> Link {r.signedUp.email}
                    </button>
                  ) : (
                    <span className="text-steel">Not signed up</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditor({ open: true, record: r, mode: 'edit' })} className="rounded p-2 text-steel hover:bg-frost hover:text-ink" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    {!r.self && (
                      <button onClick={() => remove(r)} className="rounded p-2 text-oxblood hover:bg-oxblood/10" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={6} className="px-3 py-10 text-center text-steel">No collectors match.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] text-steel">
        The role belongs to the collector's sign-in account, so it can be changed once an account is linked. Collectors sign in and see their own listing;
        Admins add, edit and delete everything and can print the book. When a collector signs in with the email on their listing, it links automatically.
      </p>

      <RecordForm
        config={config}
        entityName="Collector"
        open={editor.open}
        onOpenChange={(open) => setEditor((e) => ({ ...e, open }))}
        record={editor.record}
        mode={editor.mode}
        onSaved={() => run(async () => {}, editor.mode === 'edit' ? 'Saved.' : 'Added collector.')}
        onDelete={editor.record?.id ? () => remove(list.find((x) => x.id === editor.record.id) || editor.record) : undefined}
      />
    </div>
  );
}
