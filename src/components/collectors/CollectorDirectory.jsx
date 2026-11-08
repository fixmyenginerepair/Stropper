import { useMemo, useState } from 'react';
import { Mail, Search } from 'lucide-react';
import { COLLECTION_TYPES, contactHref } from '@/lib/collectors';

const th =
  'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-steel';
const td = 'px-3 py-3 align-middle';
const field =
  'h-11 rounded-lg border border-hair bg-white px-3 text-[14px] text-ink outline-none transition-colors focus:border-oxblood';

export default function CollectorDirectory({ collectors, loading }) {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [type, setType] = useState('');

  const countries = useMemo(
    () => [...new Set(collectors.map((row) => row.country).filter(Boolean))].sort(),
    [collectors]
  );

  const search = q.trim().toLowerCase();
  const rows = collectors.filter((row) => {
    if (search && !String(row.name || '').toLowerCase().includes(search)) return false;
    if (country && row.country !== country) return false;
    if (type && row.collection_type !== type) return false;
    return true;
  });

  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-bold text-ink">The collectors</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_220px_240px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by name"
            aria-label="Search collectors by name"
            className={`${field} w-full pl-9`}
          />
        </div>

        <select
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          aria-label="Filter by country"
          className={field}
        >
          <option value="">All countries</option>
          {countries.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filter by collection type"
          className={field}
        >
          <option value="">All collection types</option>
          {COLLECTION_TYPES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-[10px] border border-hair bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-frost/70">
                <th className={th}>Name</th>
                <th className={th}>Country</th>
                <th className={th}>Type of collection</th>
                <th className={th}># Main</th>
                <th className={th}># Sharpeners</th>
                <th className={th}>
                  <span className="sr-only">Contact</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-steel">
                    Gathering collectors…
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-steel">
                    No collectors match that search.
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-hair/70 hover:bg-frost/50">
                    <td className={`${td} font-medium text-ink`}>{row.name}</td>
                    <td className={`${td} text-steel`}>{row.country || '—'}</td>
                    <td className={`${td} text-steel`}>{row.collection_type || '—'}</td>
                    <td className={`${td} text-steel`}>{row.main_collection_size || '—'}</td>
                    <td className={`${td} text-steel`}>{row.sharpener_collection_size || '—'}</td>
                    <td className={`${td} text-right`}>
                      <a
                        href={contactHref(row.name)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-hair px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
                      >
                        <Mail className="h-3.5 w-3.5" /> Contact
                      </a>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <ul className="divide-y divide-hair/70 md:hidden">
          {loading && (
            <li className="px-4 py-8 text-center text-sm text-steel">Gathering collectors…</li>
          )}

          {!loading && rows.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-steel">
              No collectors match that search.
            </li>
          )}

          {!loading &&
            rows.map((row) => (
              <li key={row.id} className="px-4 py-4">
                <p className="font-heading text-[15px] font-bold leading-snug text-ink">{row.name}</p>
                <p className="mt-0.5 text-[13px] text-steel">
                  {[row.country, row.collection_type].filter(Boolean).join(' · ') || '—'}
                </p>
                {(row.main_collection_size || row.sharpener_collection_size) && (
                  <p className="mt-1 text-[12px] text-steel">
                    {row.main_collection_size && `Main ${row.main_collection_size}`}
                    {row.main_collection_size && row.sharpener_collection_size && ' · '}
                    {row.sharpener_collection_size && `Sharpeners ${row.sharpener_collection_size}`}
                  </p>
                )}
                <a
                  href={contactHref(row.name)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
                >
                  <Mail className="h-3.5 w-3.5" /> Contact
                </a>
              </li>
            ))}
        </ul>
      </div>

      {!loading && (
        <p className="mt-3 text-[13px] text-steel">
          {rows.length} {rows.length === 1 ? 'collector' : 'collectors'} listed
        </p>
      )}
    </section>
  );
}