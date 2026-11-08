import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import Pagination from '@/components/browse/Pagination';
import { sharpenerImage } from '@/lib/archive';

const ROWS_PER_PAGE = 40;

const th =
  'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-steel';
const td = 'px-3 py-2 align-middle';

function money(value) {
  const n = Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(n)) return '';
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function FullList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page') || 1) || 1);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      base44.entities.Sharpener.count({}),
      base44.entities.Sharpener.filter({}, 'name', ROWS_PER_PAGE, (page - 1) * ROWS_PER_PAGE),
    ]).then(([count, rows]) => {
      if (cancelled) return;
      setTotal(count);
      setItems(rows || []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / ROWS_PER_PAGE));

  const goToPage = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next > 1) params.set('page', String(next));
    else params.delete('page');
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">The archive</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          The full list
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-steel">
          Every sharpener in the archive. Click a description to view its picture and details.
        </p>
      </header>

      <div className="mt-9 overflow-hidden rounded-[10px] border border-hair bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[14px]">
            <thead>
              <tr className="bg-frost/70">
                <th className={`${th} w-14 text-right`}>#</th>
                <th className={th}>Description</th>
                <th className={th}>Country</th>
                <th className={th}>Type</th>
                <th className={th}>Rarity</th>
                <th className={`${th} text-right`}>Value</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-steel">
                    Loading the list…
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-steel">
                    No sharpeners have been recorded yet.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((item, index) => (
                  <tr key={item.id} className="border-t border-hair/70 hover:bg-frost/50">
                    <td className={`${td} text-right font-mono text-[12px] text-steel`}>
                      {(page - 1) * ROWS_PER_PAGE + index + 1}
                    </td>
                    <td className={td}>
                      <Link
                        to={`/sharpener/${item.id}`}
                        className="flex items-center gap-3 text-ink transition-colors hover:text-oxblood"
                      >
                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded border border-hair bg-frost">
                          <Image
                            src={sharpenerImage(item)}
                            alt={item.name || 'Sharpener'}
                            loading="lazy"
                            className="h-10 w-10 object-cover"
                          />
                        </span>
                        <span className="leading-snug">{item.description || item.name}</span>
                      </Link>
                    </td>
                    <td className={`${td} text-steel`}>{item.country || ''}</td>
                    <td className={`${td} text-steel`}>{item.type || ''}</td>
                    <td className={`${td} text-steel`}>{item.rarity || ''}</td>
                    <td className={`${td} text-right text-ink`}>{money(item.value)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />

      {total > 0 && (
        <p className="mt-4 text-center text-[13px] text-steel">
          Showing {items.length} of {total} sharpeners
        </p>
      )}
    </div>
  );
}