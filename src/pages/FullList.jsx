import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SharpenerTable from '@/components/list/SharpenerTable';
import SharpenerCards from '@/components/list/SharpenerCards';
import Pagination from '@/components/browse/Pagination';

const ROWS_PER_PAGE = 40;

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
  const startIndex = (page - 1) * ROWS_PER_PAGE;

  const goToPage = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next > 1) params.set('page', String(next));
    else params.delete('page');
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="archive-container py-10 sm:py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">The archive</p>
        <h1 className="mt-3 font-heading text-[1.9rem] font-bold leading-tight text-ink sm:text-[2.6rem]">
          The full list
        </h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-steel sm:text-[16px]">
          Every sharpener in the archive. Tap any entry to view its picture and details.
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-[10px] border border-hair bg-white">
        <SharpenerTable items={items} loading={loading} startIndex={startIndex} />
        <SharpenerCards items={items} loading={loading} startIndex={startIndex} />
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={goToPage} />

      {!loading && total > 0 && (
        <p className="mt-4 text-center text-[13px] text-steel">
          Showing {items.length} of {total} sharpeners
        </p>
      )}
    </div>
  );
}