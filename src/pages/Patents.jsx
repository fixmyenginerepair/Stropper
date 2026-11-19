import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Pagination from '@/components/browse/Pagination';
import PatentLookup from '@/components/patents/PatentLookup';
import { COUNTRY_NAMES, formatGrantDate, patentLabel } from '@/lib/patents';

const PAGE = 48;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = [
  { value: 'year', label: 'Oldest first' },
  { value: '-year', label: 'Newest first' },
  { value: 'number', label: 'Patent number' },
];

export default function Patents() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const country = params.get('country') || '';
  const sort = params.get('sort') || 'year';
  const page = Math.max(1, Number(params.get('page') || 1) || 1);

  const [search, setSearch] = useState(q);
  const [rows, setRows] = useState(null);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({});
  const [photos, setPhotos] = useState({}); // patent id -> photo of a piece carrying it (when no drawing)

  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const t = setTimeout(() => { if (search.trim() !== q) set({ q: search.trim() }); }, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = useMemo(() => {
    const out = {};
    if (country) out.country = country;
    if (q) {
      const digits = q.replace(/[^\d]/g, '');
      const ors = [
        { title: { $regex: escapeRegex(q), $options: 'i' } },
        { inventors: { $regex: escapeRegex(q), $options: 'i' } },
        { assignees: { $regex: escapeRegex(q), $options: 'i' } },
      ];
      if (digits.length >= 4) ors.push({ number: { $regex: `^${digits}` } });
      out.$or = ors;
    }
    return out;
  }, [q, country]);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    Promise.all([
      base44.entities.Patent.count(query),
      base44.entities.Patent.filter(query, sort, PAGE, (page - 1) * PAGE),
    ]).then(([n, list]) => {
      if (cancelled) return;
      setTotal(n || 0);
      setRows(list || []);
    }).catch(() => !cancelled && setRows([]));
    return () => { cancelled = true; };
  }, [query, sort, page]);

  // For patents with no drawing, borrow the photo of a piece in the collection that carries the patent.
  useEffect(() => {
    if (!rows?.length) return undefined;
    let cancelled = false;
    const need = rows.filter((p) => !p.drawing_urls?.length && p.sharpener_ids?.length);
    const ids = [...new Set(need.flatMap((p) => p.sharpener_ids.slice(0, 6)))];
    if (!ids.length) return undefined;
    base44.entities.Sharpener.filter({ id: { $in: ids } }, 'name', ids.length, 0, ['id', 'images'])
      .then((list) => {
        if (cancelled) return;
        const img = Object.fromEntries((list || []).filter((s) => s.images?.[0]).map((s) => [s.id, s.images[0]]));
        const out = {};
        need.forEach((p) => {
          const hit = p.sharpener_ids.find((id) => img[id]);
          if (hit) out[p.id] = img[hit];
        });
        setPhotos(out);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [rows]);

  useEffect(() => {
    Promise.all(Object.keys(COUNTRY_NAMES).filter((c) => c !== 'Other').map((c) =>
      base44.entities.Patent.count({ country: c }).then((n) => [c, n]).catch(() => [c, 0])
    )).then((pairs) => setCounts(Object.fromEntries(pairs.filter(([, n]) => n))));
  }, []);

  const totalAll = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">The archive</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">Patents</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-steel">
          Every patent marked on the sharpeners in the collection{totalAll ? ` (${totalAll.toLocaleString()} in all)` : ''}, with
          the original drawings, inventors and dates, and the pieces that carry each number.
        </p>
      </header>

      <PatentLookup />

      <h2 className="mt-12 font-heading text-xl font-bold text-ink sm:text-2xl">The full patent list</h2>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number, title, inventor or company"
            className="h-11 w-full rounded-lg border border-hair bg-white pl-9 pr-9 text-sm text-ink focus:border-oxblood focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-steel hover:text-ink" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select value={sort} onChange={(e) => set({ sort: e.target.value === 'year' ? '' : e.target.value })} className="h-11 rounded-lg border border-hair bg-white px-3 text-sm text-ink focus:border-oxblood focus:outline-none" aria-label="Sort">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => set({ country: '' })} className={`rounded-full border px-3 py-1.5 text-[13px] ${!country ? 'border-navy bg-navy text-white' : 'border-hair bg-white text-ink hover:border-oxblood'}`}>
          All countries
        </button>
        {Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
          <button key={c} onClick={() => set({ country: c })} className={`rounded-full border px-3 py-1.5 text-[13px] ${country === c ? 'border-navy bg-navy text-white' : 'border-hair bg-white text-ink hover:border-oxblood'}`}>
            {COUNTRY_NAMES[c]} <span className="opacity-60">{n}</span>
          </button>
        ))}
      </div>

      <p className="mt-6 border-b border-hair pb-3 text-[14px] text-steel">
        {rows === null ? 'Loading…' : `${total.toLocaleString()} patent${total === 1 ? '' : 's'}`}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {rows === null && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[10px] border border-hair bg-white">
            <div className="aspect-[3/4] animate-pulse bg-frost" />
            <div className="space-y-2 p-4"><div className="h-3 w-1/2 animate-pulse rounded bg-frost" /><div className="h-3 w-3/4 animate-pulse rounded bg-frost" /></div>
          </div>
        ))}
        {rows?.map((p) => (
          <Link key={p.id} to={`/patents/${p.id}`} className="group overflow-hidden rounded-[10px] border border-hair bg-white transition-colors hover:border-oxblood">
            <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-[#fbf9f4]">
              {p.drawing_urls?.[0] ? (
                <img src={p.drawing_urls[0]} alt="" loading="lazy" className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]" />
              ) : photos[p.id] ? (
                <span className="relative block h-full w-full bg-white">
                  <img src={photos[p.id]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <span className="absolute bottom-2 left-2 rounded bg-white/90 px-1.5 py-0.5 text-[10.5px] font-medium text-steel">From the collection</span>
                </span>
              ) : (
                <span className="px-4 text-center font-heading text-lg font-bold text-hair">{patentLabel(p)}</span>
              )}
            </div>
            <div className="border-t border-hair p-4">
              <p className="font-mono text-[12px] text-oxblood">{patentLabel(p)}</p>
              <h3 className="mt-1 line-clamp-2 font-heading text-[15px] font-bold leading-snug text-ink">
                {p.title || <span className="font-normal italic text-steel">Title not yet identified</span>}
              </h3>
              <p className="mt-1 truncate text-[12.5px] text-steel">
                {[p.inventors?.[0], formatGrantDate(p) && (p.grant_date ? p.grant_date.slice(0, 4) : p.year)].filter(Boolean).join(' · ')}
              </p>
              <p className="mt-2 text-[12px] text-steel">
                {p.sharpener_ids?.length ? `${p.sharpener_ids.length} piece${p.sharpener_ids.length === 1 ? '' : 's'}` : ''}
                {p.verified === false && <span className="ml-2 rounded bg-oxblood/10 px-1.5 py-0.5 text-[11px] text-oxblood">to check</span>}
              </p>
            </div>
          </Link>
        ))}
      </div>
      {rows?.length === 0 && <p className="mt-10 text-center text-steel">No patents match.</p>}

      <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / PAGE))} onChange={(p) => { set({ page: p > 1 ? String(p) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
    </div>
  );
}