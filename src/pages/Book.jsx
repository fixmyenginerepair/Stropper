import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FilterPanel from '@/components/browse/FilterPanel';
import BookEntry from '@/components/book/BookEntry';
import { buildQuery, readFilters } from '@/lib/filters';
import { SITE } from '@/lib/site';

export default function Book() {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];

  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [scope, setScope] = useState(() => {
    if (ids.length) return 'selection';
    return searchParams.get('scope') === 'all' ? 'all' : 'filters';
  });
  const [layout, setLayout] = useState(() =>
    searchParams.get('layout') === 'full' ? 'full' : 'compact'
  );
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const query =
      scope === 'selection' && ids.length
        ? { id: { $in: ids } }
        : scope === 'all'
          ? {}
          : buildQuery(filters);

    // Page through every match so "The entire archive" includes all of it.
    const fetchAll = async () => {
      let all = [];
      let cursor;
      do {
        const page = await base44.entities.Sharpener.filter(query, {
          sort: 'name',
          limit: 200,
          ...(cursor ? { cursor } : {}),
        });
        all = all.concat(page.items || []);
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor && !cancelled);
      return all;
    };

    fetchAll().then((all) => {
      if (cancelled) return;
      setItems(all);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [scope, idsParam, JSON.stringify(filters)]);

  const print = () => window.print();

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl print:hidden">
        <p className="eyebrow text-oxblood">The book</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          Build your own book
        </h1>
        <p className="mt-3 text-[16px] text-steel">
          Choose the whole archive or narrow it with filters, then print — or save as PDF — from
          your browser.
        </p>
      </header>

      <div className="mt-9 grid gap-8 lg:grid-cols-[280px_1fr] print:block">
        <aside className="space-y-4 print:hidden lg:sticky lg:top-[104px] lg:self-start">
          <div className="rounded-[10px] border border-hair bg-white p-5">
            <h2 className="font-heading text-lg font-bold text-ink">What to include</h2>
            {ids.length > 0 && (
              <label className="mt-3 flex items-center gap-2 text-[13px] text-ink">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'selection'}
                  onChange={() => setScope('selection')}
                  className="h-4 w-4 accent-[#680000]"
                />
                My book selection ({ids.length})
              </label>
            )}
            <label className="mt-3 flex items-center gap-2 text-[13px] text-ink">
              <input
                type="radio"
                name="scope"
                checked={scope === 'all'}
                onChange={() => setScope('all')}
                className="h-4 w-4 accent-[#680000]"
              />
              The entire archive
            </label>
            <label className="mt-3 flex items-center gap-2 text-[13px] text-ink">
              <input
                type="radio"
                name="scope"
                checked={scope === 'filters'}
                onChange={() => setScope('filters')}
                className="h-4 w-4 accent-[#680000]"
              />
              Only the filters below
            </label>
          </div>

          <div className="rounded-[10px] border border-hair bg-white p-5">
            <h2 className="font-heading text-lg font-bold text-ink">Page layout</h2>
            <label className="mt-3 flex items-center gap-2 text-[13px] text-ink">
              <input
                type="radio"
                name="layout"
                checked={layout === 'compact'}
                onChange={() => setLayout('compact')}
                className="h-4 w-4 accent-[#680000]"
              />
              Compact — several sharpeners per page
            </label>
            <label className="mt-3 flex items-center gap-2 text-[13px] text-ink">
              <input
                type="radio"
                name="layout"
                checked={layout === 'full'}
                onChange={() => setLayout('full')}
                className="h-4 w-4 accent-[#680000]"
              />
              Full — one sharpener per page
            </label>
          </div>

          {scope === 'filters' && (
            <FilterPanel
              values={filters}
              onApply={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
              onClear={() =>
                setFilters({
                  q: '',
                  letter: '',
                  country: '',
                  type: '',
                  rarity: '',
                  collector: '',
                  updated: '',
                  sort: 'name',
                  page: 1,
                })
              }
            />
          )}
        </aside>

        <div>
          <div className="flex flex-col gap-3 border-b border-hair pb-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <p className="text-[15px] text-ink">
              <span className="font-semibold">{loading ? '…' : items.length}</span> entries in this
              book
            </p>
            <button
              onClick={print}
              disabled={loading || items.length === 0}
              className="flex h-11 items-center gap-2 rounded-lg bg-oxblood px-5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:opacity-50"
            >
              <Printer className="h-4 w-4" /> Build the PDF
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <section className="book-cover overflow-hidden rounded-[10px] border border-hair bg-white print:rounded-none print:border-0">
              <div className="bg-navy px-8 py-12 text-center">
                <img src={SITE.logo} alt="Stropper.com" className="mx-auto h-12 w-auto" />
                <h2 className="mt-8 font-heading text-3xl font-bold text-white">
                  The World of Razor Sharpeners
                </h2>
                <div className="mx-auto mt-4 h-[3px] w-16 bg-oxblood" />
                <p className="mt-4 text-[13px] text-white/65">
                  Stropper.com · {items.length} catalogued sharpeners
                </p>
              </div>
            </section>

            {loading ? (
              <p className="rounded-[10px] border border-hair bg-white p-10 text-center text-sm text-steel">
                Gathering the archive…
              </p>
            ) : items.length === 0 ? (
              <p className="rounded-[10px] border border-hair bg-white p-10 text-center text-sm text-steel">
                No sharpeners match these filters.
              </p>
            ) : (
              <div
                className={
                  layout === 'compact' ? 'book-grid grid gap-3 sm:grid-cols-2' : 'book-list space-y-5'
                }
              >
                {items.map((sharpener, index) => (
                  <BookEntry
                    key={sharpener.id}
                    sharpener={sharpener}
                    index={index + 1}
                    compact={layout === 'compact'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}