import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown, ArrowUp, Copy, Download, ExternalLink, Loader2, Pencil, Plus, Search, Trash2, Upload, X,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import RecordForm, { inputClass } from '@/components/admin/RecordForm';
import Pagination from '@/components/browse/Pagination';
import { allFields, choicesFor, fieldByKey } from '@/lib/adminConfig';
import { downloadCsv, parseCsv, toCsv } from '@/lib/csv';
import { clearCache, limited } from '@/lib/limited';

const PAGE = 50;
const SYSTEM_FIELDS = ['id', 'created_date', 'updated_date', 'created_by'];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const th = 'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-steel';
const td = 'px-3 py-2 align-middle';
const btn = 'flex h-10 items-center gap-2 rounded-lg border border-hair bg-white px-3 text-sm font-medium text-ink transition-colors hover:border-oxblood hover:text-oxblood disabled:opacity-50';

function cellValue(col, row) {
  const v = row[col.key];
  if (col.kind === 'thumb') {
    const src = Array.isArray(v) ? v[0] : v;
    return src ? <img src={src} alt="" loading="lazy" className="h-10 w-10 rounded border border-hair object-cover" /> : <span className="block h-10 w-10 rounded border border-hair bg-frost" />;
  }
  if (v === null || v === undefined || v === '') return <span className="text-steel/50">—</span>;
  if (col.kind === 'money') return `$${Number(v).toLocaleString('en-US')}`;
  if (col.kind === 'date') return new Date(v).toLocaleDateString();
  if (col.kind === 'bool' || typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  return String(v);
}

export default function EntityManager({ entityName, config, onChanged }) {
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(config.defaultSort);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [editor, setEditor] = useState({ open: false, record: null, mode: 'create' });
  const [confirm, setConfirm] = useState(null); // { title, body, action }
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [bulk, setBulk] = useState({ field: '', value: '' });
  const importRef = useRef(null);
  const requestId = useRef(0);
  // base44.entities returns a new handle on every access, so pin it per table.
  // (Using it directly as a hook dependency caused an endless reload loop.)
  const entity = useMemo(() => base44.entities[entityName], [entityName]);

  // Reset when switching tables
  useEffect(() => {
    setSearch(''); setTerm(''); setFilters({}); setSort(config.defaultSort); setPage(1); setSelected(new Set());
  }, [entityName, config.defaultSort]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setTerm(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const query = useMemo(() => {
    const q = {};
    if (term) {
      const ors = config.searchFields.map((k) => ({ [k]: { $regex: escapeRegex(term), $options: 'i' } }));
      if (config.numericSearchField && /^\d+$/.test(term)) ors.push({ [config.numericSearchField]: Number(term) });
      if (/^[a-f0-9]{24}$/i.test(term)) ors.push({ id: term });
      q.$or = ors;
    }
    Object.entries(filters).forEach(([k, v]) => {
      if (v === '') return;
      const f = fieldByKey(config, k);
      if (f?.kind === 'checkbox') q[k] = v === 'true' ? true : { $ne: true };
      else q[k] = v;
    });
    return q;
  }, [term, filters, config]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const [count, items] = await Promise.all([
        limited(() => entity.count(query)),
        limited(() => entity.filter(query, sort, PAGE, (page - 1) * PAGE)),
      ]);
      if (id !== requestId.current) return; // a newer search replaced this one
      setTotal(count || 0);
      setRows(items || []);
      setNotice('');
    } catch (err) {
      if (id !== requestId.current) return;
      setNotice(`Could not load: ${err?.message || err}`);
      setRows([]);
    }
    setLoading(false);
  }, [entity, query, sort, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelected(new Set()); }, [query, page, sort]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 5000); };
  const refresh = async (msg) => { if (msg) flash(msg); clearCache('ref:'); await load(); onChanged?.(); };

  const toggleSort = (key) => {
    if (!key || key === 'images' || key === 'image' || key === 'cover_image') return;
    setSort((s) => (s === key ? `-${key}` : key));
    setPage(1);
  };

  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => setSelected(allOnPage ? new Set() : new Set(rows.map((r) => r.id)));
  const toggle = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const title = (r) => r[config.titleField] || 'Untitled';

  const askDelete = (records) => setConfirm({
    title: records.length === 1 ? `Delete “${title(records[0])}”?` : `Delete ${records.length} ${config.label.toLowerCase()}?`,
    body: 'This permanently removes the record from the database. It cannot be undone.',
    action: async () => {
      setBusy('Deleting…');
      try {
        for (let i = 0; i < records.length; i += 10) {
          await Promise.all(records.slice(i, i + 10).map((r) => limited(() => entity.delete(r.id))));
        }
        setSelected(new Set());
        setEditor((e) => ({ ...e, open: false }));
        await refresh(`Deleted ${records.length} record${records.length === 1 ? '' : 's'}.`);
      } catch (err) {
        flash(`Delete failed: ${err?.message || err}`);
      }
      setBusy('');
    },
  });

  const duplicate = (r) => {
    const copy = { ...r };
    SYSTEM_FIELDS.forEach((k) => delete copy[k]);
    if (config.titleField) copy[config.titleField] = `${copy[config.titleField] || ''} (copy)`;
    if ('legacy_id' in copy) delete copy.legacy_id;
    setEditor({ open: true, record: copy, mode: 'create' });
  };

  // Bulk edit
  const bulkField = bulk.field ? fieldByKey(config, bulk.field) : null;
  const applyBulk = async () => {
    if (!bulkField) return;
    let value = bulk.value;
    if (bulkField.kind === 'checkbox') value = value === 'true';
    else if (value === '') value = null;
    const ids = [...selected];
    setBusy('Updating…');
    try {
      for (let i = 0; i < ids.length; i += 200) {
        const batch = ids.slice(i, i + 200).map((id) => ({ id, [bulk.field]: value }));
        await limited(() => entity.bulkUpdate(batch));
      }
      setBulk({ field: '', value: '' });
      await refresh(`Updated ${bulkField.label} on ${ids.length} record${ids.length === 1 ? '' : 's'}.`);
    } catch (err) {
      flash(`Bulk update failed: ${err?.message || err}`);
    }
    setBusy('');
  };

  // Export everything matching the current search/filters
  const exportCsv = async () => {
    setBusy('Exporting…');
    try {
      const all = [];
      for (let skip = 0; ; skip += 500) {
        const chunk = await limited(() => entity.filter(query, sort, 500, skip));
        all.push(...(chunk || []));
        if (!chunk || chunk.length < 500) break;
      }
      const headers = ['id', ...allFields(config).map((f) => f.key), 'created_date', 'updated_date'];
      downloadCsv(`${entityName.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(all, headers));
      flash(`Exported ${all.length} records.`);
    } catch (err) {
      flash(`Export failed: ${err?.message || err}`);
    }
    setBusy('');
  };

  // Import: rows with an existing id are updated, others are added
  const importCsv = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const parsed = parseCsv(await file.text());
    const fields = allFields(config);
    const records = parsed.map((row) => {
      const out = {};
      if (row.id) out.id = row.id.trim();
      fields.forEach((f) => {
        if (!(f.key in row)) return;
        const raw = String(row[f.key] ?? '').trim();
        if (raw === '') return;
        if (f.kind === 'number') { const n = Number(raw.replace(/[$,]/g, '')); if (Number.isFinite(n)) out[f.key] = n; }
        else if (f.kind === 'checkbox') out[f.key] = /^(true|yes|y|1|x)$/i.test(raw);
        else if (f.kind === 'list' || f.kind === 'images') out[f.key] = raw.split(/\s*\|\s*|\n/).filter(Boolean);
        else out[f.key] = raw;
      });
      return out;
    }).filter((r) => Object.keys(r).some((k) => k !== 'id'));

    const updates = records.filter((r) => r.id);
    const creates = records.filter((r) => !r.id);
    if (!records.length) { flash('No usable rows found. The first row must hold column names matching the export.'); return; }

    setConfirm({
      title: `Import ${file.name}?`,
      body: `${creates.length} new record${creates.length === 1 ? '' : 's'} will be added and ${updates.length} existing record${updates.length === 1 ? '' : 's'} updated (matched by id). Tip: export first so you have a backup.`,
      action: async () => {
        setBusy('Importing…');
        try {
          for (let i = 0; i < creates.length; i += 200) {
            const batch = creates.slice(i, i + 200);
            await limited(() => entity.bulkCreate(batch));
          }
          for (let i = 0; i < updates.length; i += 200) {
            const batch = updates.slice(i, i + 200);
            await limited(() => entity.bulkUpdate(batch));
          }
          await refresh(`Imported: ${creates.length} added, ${updates.length} updated.`);
        } catch (err) {
          flash(`Import failed: ${err?.message || err}`);
        }
        setBusy('');
      },
    });
  };

  const filterFields = (config.filters || []).map((k) => fieldByKey(config, k)).filter(Boolean);
  const bulkFields = (config.bulkFields || []).map((k) => fieldByKey(config, k)).filter(Boolean);
  const totalPages = Math.max(1, Math.ceil(total / PAGE));
  const selectedRows = rows.filter((r) => selected.has(r.id));

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${config.label.toLowerCase()}${config.numericSearchField ? ' or old ID' : ''}…`}
            className={`${inputClass} mt-0 pl-9`}
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-steel hover:text-ink" aria-label="Clear search"><X className="h-4 w-4" /></button>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditor({ open: true, record: null, mode: 'create' })} className="flex h-10 items-center gap-2 rounded-lg bg-oxblood px-4 text-sm font-semibold text-white hover:bg-oxblood-dark">
            <Plus className="h-4 w-4" /> Add {config.singular}
          </button>
          <button onClick={() => importRef.current?.click()} disabled={!!busy} className={btn}><Upload className="h-4 w-4" /> Import CSV</button>
          <button onClick={exportCsv} disabled={!!busy} className={btn}><Download className="h-4 w-4" /> Export CSV</button>
          <input ref={importRef} type="file" accept=".csv,text/csv" hidden onChange={importCsv} />
        </div>
      </div>

      {filterFields.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {filterFields.map((f) => (
            <select
              key={f.key}
              value={filters[f.key] || ''}
              onChange={(e) => { setFilters((p) => ({ ...p, [f.key]: e.target.value })); setPage(1); }}
              className={`${inputClass} mt-0 h-9 w-auto min-w-[140px] text-[13px]`}
            >
              <option value="">{f.kind === 'checkbox' ? f.label.split(' —')[0] : `All ${f.label.toLowerCase()}`}{f.kind === 'checkbox' ? ': any' : ''}</option>
              {choicesFor(f).map((c) => <option key={c.value} value={c.value}>{f.kind === 'checkbox' ? `${f.label.split(' —')[0]}: ${c.label}` : c.label}</option>)}
            </select>
          ))}
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({})} className="text-[13px] font-medium text-oxblood hover:underline">Clear filters</button>
          )}
        </div>
      )}

      {/* Status line */}
      <div className="mt-4 flex min-h-[28px] flex-wrap items-center justify-between gap-2 text-[13px]">
        <span className="text-steel">
          {loading ? 'Loading…' : `${total.toLocaleString()} ${total === 1 ? config.singular : config.label.toLowerCase()}`}
          {busy && <span className="ml-3 inline-flex items-center gap-1 text-ink"><Loader2 className="h-3.5 w-3.5 animate-spin" />{busy}</span>}
        </span>
        {notice && <span className="rounded bg-navy/5 px-2 py-1 text-navy">{notice}</span>}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-oxblood/30 bg-oxblood/5 px-3 py-2 text-[13px]">
          <span className="font-semibold text-ink">{selected.size} selected</span>
          {bulkFields.length > 0 && (
            <>
              <span className="text-steel">· Set</span>
              <select value={bulk.field} onChange={(e) => setBulk({ field: e.target.value, value: '' })} className={`${inputClass} mt-0 h-9 w-auto text-[13px]`}>
                <option value="">choose field…</option>
                {bulkFields.map((f) => <option key={f.key} value={f.key}>{f.label.split(' —')[0]}</option>)}
              </select>
              {bulkField && (bulkField.kind === 'select' || bulkField.kind === 'checkbox' ? (
                <select value={bulk.value} onChange={(e) => setBulk((b) => ({ ...b, value: e.target.value }))} className={`${inputClass} mt-0 h-9 w-auto text-[13px]`}>
                  <option value="">{bulkField.kind === 'checkbox' ? 'choose…' : '(clear)'}</option>
                  {choicesFor(bulkField).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              ) : (
                <input value={bulk.value} onChange={(e) => setBulk((b) => ({ ...b, value: e.target.value }))} placeholder="new value" className={`${inputClass} mt-0 h-9 w-40 text-[13px]`} />
              ))}
              {bulkField && (
                <button onClick={applyBulk} disabled={!!busy || (bulkField.kind === 'checkbox' && bulk.value === '')} className="h-9 rounded-lg bg-navy px-3 font-semibold text-white disabled:opacity-50">Apply</button>
              )}
            </>
          )}
          <button onClick={() => askDelete(selectedRows)} disabled={!!busy} className="ml-auto flex h-9 items-center gap-1.5 rounded-lg px-3 font-semibold text-oxblood hover:bg-oxblood/10">
            <Trash2 className="h-4 w-4" /> Delete selected
          </button>
          <button onClick={() => setSelected(new Set())} className="h-9 px-2 text-steel hover:text-ink">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="mt-3 overflow-x-auto rounded-[10px] border border-hair bg-white">
        <table className="w-full border-collapse text-[13.5px]">
          <thead>
            <tr className="bg-frost/70">
              <th className={`${th} w-10`}>
                <input type="checkbox" checked={allOnPage} onChange={toggleAll} className="h-4 w-4 accent-[#680000]" aria-label="Select all on this page" />
              </th>
              {config.columns.map((c) => (
                <th key={c.key} className={th}>
                  <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1 uppercase hover:text-ink">
                    {c.label}
                    {sort === c.key && <ArrowUp className="h-3 w-3" />}
                    {sort === `-${c.key}` && <ArrowDown className="h-3 w-3" />}
                  </button>
                </th>
              ))}
              <th className={`${th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={config.columns.length + 2} className="px-3 py-12 text-center text-steel">Loading…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={config.columns.length + 2} className="px-3 py-12 text-center text-steel">No records match.</td></tr>
            )}
            {!loading && rows.map((r) => (
              <tr key={r.id} className={`border-t border-hair/70 hover:bg-frost/50 ${selected.has(r.id) ? 'bg-oxblood/5' : ''}`}>
                <td className={td}><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="h-4 w-4 accent-[#680000]" aria-label="Select row" /></td>
                {config.columns.map((c) => (
                  <td key={c.key} className={`${td} ${c.key === config.titleField ? 'max-w-[320px] font-medium text-ink' : 'text-steel'}`}>
                    {c.key === config.titleField ? (
                      <button onClick={() => setEditor({ open: true, record: r, mode: 'edit' })} className="text-left hover:text-oxblood">{cellValue(c, r)}</button>
                    ) : cellValue(c, r)}
                  </td>
                ))}
                <td className={`${td} whitespace-nowrap text-right`}>
                  <div className="inline-flex gap-0.5">
                    <button onClick={() => setEditor({ open: true, record: r, mode: 'edit' })} className="rounded p-2 text-steel hover:bg-frost hover:text-ink" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => duplicate(r)} className="rounded p-2 text-steel hover:bg-frost hover:text-ink" title="Duplicate"><Copy className="h-4 w-4" /></button>
                    {config.viewPath && (
                      <Link to={config.viewPath(r)} target="_blank" className="rounded p-2 text-steel hover:bg-frost hover:text-ink" title="View on site"><ExternalLink className="h-4 w-4" /></Link>
                    )}
                    <button onClick={() => askDelete([r])} className="rounded p-2 text-steel hover:bg-oxblood/10 hover:text-oxblood" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      <RecordForm
        config={config}
        entityName={entityName}
        open={editor.open}
        onOpenChange={(open) => setEditor((e) => ({ ...e, open }))}
        record={editor.record}
        mode={editor.mode}
        onSaved={() => refresh(editor.mode === 'edit' ? 'Saved.' : `Added ${config.singular}.`)}
        onDelete={editor.record?.id ? () => askDelete([editor.record]) : undefined}
      />

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm?.body}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-oxblood hover:bg-oxblood-dark"
              onClick={() => { const a = confirm?.action; setConfirm(null); a?.(); }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
