import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FilterPanel from '@/components/browse/FilterPanel';
import Pagination from '@/components/browse/Pagination';
import SharpenerCard from '@/components/SharpenerCard';
import { PAGE_SIZE, SORT_OPTIONS } from '@/lib/archive';
import { buildQuery, fetchResultPage, filtersToParams, readFilters } from '@/lib/filters';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const paramsKey = searchParams.toString();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const query = buildQuery(filters);

    Promise.all([
      base44.entities.Sharpener.count(query),
      fetchResultPage(base44.entities.Sharpener, query, filters.sort, filters.page),
    ]).then(([count, pageItems]) => {
      if (cancelled) return;
      setTotal(count);
      setItems(pageItems);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [paramsKey]);

  const apply = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const clear = () => setSearchParams(new URLSearchParams(), { replace: true });

  const goToPage = (page) => {
    const next = new URLSearchParams(searchParams);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const bookParams = filtersToParams(filters).toString();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label || 'Name A–Z';

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">The archive</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          Browse the archive
        </h1>
        <p className="mt-3 text-[16px] text-steel">
          Combine any filters — results match all of them.
        </p>
      </header>

      <div className="mt-9 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-[104px] lg:self-start">
          <FilterPanel values={filters} onApply={apply} onClear={clear} />
        </aside>

        <div>
          <div className="flex flex-col gap-4 border-b border-hair pb-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-ink">
              <span className="font-semibold">{loading ? '…' : total}</span> sharpeners
              <span className="text-steel"> · sorted {sortLabel}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.sort}
                onChange={(e) => apply({ sort: e.target.value === 'name' ? '' : e.target.value })}
                aria-label="Sort results"
                className="h-10 rounded-lg border border-hair bg-white px-3 text-sm text-ink focus:border-oxblood focus:outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Link
                to={`/book${bookParams ? `?${bookParams}` : ''}`}
                className="flex h-10 items-center gap-2 rounded-lg border border-hair bg-white px-4 text-sm font-medium text-ink transition-colors hover:border-oxblood hover:text-oxblood"
              >
                <Printer className="h-4 w-4" /> Print these as a book
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[10px] border border-hair bg-white"
                >
                  <div className="aspect-square animate-pulse bg-frost" />
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-frost" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-frost" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10 rounded-[10px] border border-hair bg-white p-12 text-center">
              <h2 className="font-heading text-xl font-bold text-ink">No sharpeners match</h2>
              <p className="mt-2 text-[15px] text-steel">
                Try a broader search, or clear the filters and start again.
              </p>
              <button
                onClick={clear}
                className="mt-5 rounded-lg bg-oxblood px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((sharpener) => (
                <SharpenerCard key={sharpener.id} sharpener={sharpener} />
              ))}
            </div>
          )}

          <Pagination page={filters.page} totalPages={totalPages} onChange={goToPage} />
        </div>
      </div>
    </div>
  );
}