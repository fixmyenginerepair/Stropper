import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { clearCache, limited } from '@/lib/limited';
import { copiesOf as qty, FOUNDER_COLLECTION } from '@/lib/collectionCounts';

const PAGE = 100;
const fmt = (n) => Number(n || 0).toLocaleString();

// Collection counts: one row per piece, with an editable "copies owned" number.
// Different pieces = number of rows; total with copies = sum of copies (blank counts as 1).
export default function CountsPanel() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [owner, setOwner] = useState(FOUNDER_COLLECTION);
  const [onlyMulti, setOnlyMulti] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [saving, setSaving] = useState({});
  const timers = useRef({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let all = [];
        let cursor;
        do {
          const page = await limited(() =>
            base44.entities.Sharpener.filter({}, { sort: 'name', limit: 200, ...(cursor ? { cursor } : {}) })
          );
          all = all.concat(page.items || []);
          cursor = page.has_more ? page.next_cursor : null;
        } while (cursor && !cancelled);
        if (!cancelled) setRows(all.map(({ id, name, type: t, legacy_id, collection, copies }) => ({ id, name, type: t, legacy_id, collection, copies })));
      } catch {
        if (!cancelled) setError('Could not load the collection. Refresh to try again.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const owners = useMemo(() => [...new Set((rows || []).map((r) => r.collection).filter(Boolean))].sort(), [rows]);
  const scoped = useMemo(() => (rows || []).filter((r) => !owner || r.collection === owner), [rows, owner]);

  const totals = useMemo(() => {
    const byType = new Map();
    let copies = 0;
    scoped.forEach((r) => {
      const k = r.type || 'Unknown';
      const t = byType.get(k) || { type: k, pieces: 0, copies: 0 };
      if (qty(r) > 0) t.pieces += 1;
      t.copies += qty(r);
      copies += qty(r);
      byType.set(k, t);
    });
    return { pieces: scoped.filter((r) => qty(r) > 0).length, catalogued: scoped.length, copies, types: [...byType.values()].sort((a, b) => b.copies - a.copies) };
  }, [scoped]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return scoped.filter((r) =>
      (!type || (r.type || 'Unknown') === type) &&
      (!onlyMulti || qty(r) !== 1) &&
      (!needle || (r.name || '').toLowerCase().includes(needle) || String(r.legacy_id ?? '') === needle)
    );
  }, [scoped, q, type, onlyMulti]);

  useEffect(() => setShown(PAGE), [q, type, owner, onlyMulti]);

  const setCopies = (id, value) => {
    const n = value === '' ? '' : Math.max(0, Math.floor(Number(value)));
    if (n !== '' && !Number.isFinite(n)) return;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, copies: n } : r)));
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(async () => {
      setSaving((s) => ({ ...s, [id]: 'saving' }));
      try {
        await limited(() => base44.entities.Sharpener.update(id, { copies: n === '' ? 1 : n }));
        clearCache('stats:');
        clearCache('counts:');
        setSaving((s) => ({ ...s, [id]: 'saved' }));
      } catch {
        setSaving((s) => ({ ...s, [id]: 'error' }));
      }
    }, 600);
  };

  if (error) return <p className="rounded-[10px] border border-hair bg-white p-6 text-oxblood">{error}</p>;
  if (!rows) return <p className="rounded-[10px] border border-hair bg-white p-6 text-center text-steel">Loading the whole collection…</p>;

  const stat = (label, value, note) => (
    <div className="rounded-[10px] border border-hair bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-ink">{value}</p>
      {note && <p className="mt-1 text-[12.5px] text-steel">{note}</p>}
    </div>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stat('Different pieces', fmt(totals.pieces), `Count 1 or more · ${fmt(totals.catalogued)} catalogued, ${fmt(totals.catalogued - totals.pieces)} at 0`)}
        {stat('Total count', fmt(totals.copies), `${fmt(totals.copies - totals.pieces)} more than different pieces`)}
        {stat('Types', fmt(totals.types.length), 'Categories in use')}
      </div>

      <details className="mt-4 rounded-[10px] border border-hair bg-white">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-ink">Counts by type</summary>
        <table className="w-full text-[14px]">
          <thead className="border-t border-hair bg-frost text-left text-[11px] uppercase tracking-[0.12em] text-steel">
            <tr><th className="px-4 py-2">Type</th><th className="px-4 py-2 text-right">Different</th><th className="px-4 py-2 text-right">Total count</th></tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {totals.types.map((t) => (
              <tr key={t.type} className="cursor-pointer hover:bg-frost" onClick={() => setType(t.type)}>
                <td className="px-4 py-2 text-ink">{t.type}</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmt(t.pieces)}</td>
                <td className="px-4 py-2 text-right tabular-nums font-semibold">{fmt(t.copies)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-hair bg-white px-3 py-2">
          <Search className="h-4 w-4 text-steel" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or old ID" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-hair bg-white px-3 py-2 text-sm">
          <option value="">All types</option>
          {totals.types.map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
        </select>
        {owners.length > 1 && (
          <select value={owner} onChange={(e) => setOwner(e.target.value)} className="rounded-lg border border-hair bg-white px-3 py-2 text-sm">
            <option value="">All collections</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={onlyMulti} onChange={(e) => setOnlyMulti(e.target.checked)} /> Only count 2+ (or 0)
        </label>
      </div>

      <p className="mt-3 text-[13px] text-steel">
        {fmt(filtered.length)} pieces · total count {fmt(filtered.reduce((s, r) => s + qty(r), 0))}. Type a number and it saves on its own.
      </p>

      <div className="mt-2 overflow-x-auto rounded-[10px] border border-hair bg-white">
        <table className="w-full text-[14px]">
          <thead className="bg-frost text-left text-[11px] uppercase tracking-[0.12em] text-steel">
            <tr>
              <th className="px-3 py-2">Old ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2 text-center">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hair">
            {filtered.slice(0, shown).map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-1.5 tabular-nums text-steel">{r.legacy_id ?? ''}</td>
                <td className="px-3 py-1.5"><Link to={`/sharpener/${r.id}`} className="text-ink hover:text-oxblood">{r.name}</Link></td>
                <td className="px-3 py-1.5 text-steel">{r.type || ''}</td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1">
                    <button aria-label="One fewer" onClick={() => setCopies(r.id, Math.max(0, qty(r) - 1))} className="rounded border border-hair p-1 hover:border-oxblood"><Minus className="h-3.5 w-3.5" /></button>
                    <input
                      type="number" min="0" inputMode="numeric"
                      value={r.copies === '' ? '' : qty(r)}
                      onChange={(e) => setCopies(r.id, e.target.value)}
                      className="w-14 rounded border border-hair px-1 py-1 text-center tabular-nums"
                    />
                    <button aria-label="One more" onClick={() => setCopies(r.id, qty(r) + 1)} className="rounded border border-hair p-1 hover:border-oxblood"><Plus className="h-3.5 w-3.5" /></button>
                    <span className="w-12 text-[11px] text-steel">
                      {saving[r.id] === 'saving' ? 'Saving…' : saving[r.id] === 'saved' ? 'Saved' : saving[r.id] === 'error' ? <span className="text-oxblood">Failed</span> : ''}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length && <tr><td colSpan={4} className="px-3 py-6 text-center text-steel">No pieces match.</td></tr>}
          </tbody>
        </table>
      </div>
      {filtered.length > shown && (
        <button onClick={() => setShown((n) => n + PAGE)} className="mt-3 w-full rounded-lg border border-hair bg-white py-2.5 text-sm font-semibold text-ink hover:border-oxblood">
          Show more ({fmt(filtered.length - shown)} left)
        </button>
      )}
    </div>
  );
}
