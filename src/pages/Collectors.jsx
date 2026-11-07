import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function Collectors() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Sharpener.aggregate({ groupBy: 'collection' }).then((result) => {
      const list = (result.rows || [])
        .filter((row) => row.collection)
        .sort((a, b) => b.count - a.count);
      setRows(list);
      setLoading(false);
    });
  }, []);

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">The people</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          Collectors
        </h1>
        <p className="mt-3 text-[16px] text-steel">
          Every sharpener in the archive belongs to a collection. These are the collector IDs
          represented here — use one to narrow the archive to that collection.
        </p>
      </header>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <p className="text-sm text-steel">Gathering collectors…</p>
        )}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-steel">No collections have been recorded yet.</p>
        )}
        {rows.map((row) => (
          <Link
            key={row.collection}
            to={`/browse?collector=${encodeURIComponent(row.collection)}`}
            className="group rounded-[10px] border border-hair bg-white p-6 transition-colors hover:border-oxblood"
          >
            <p className="eyebrow text-oxblood">Collector ID</p>
            <h2 className="mt-2 font-heading text-xl font-bold text-ink">{row.collection}</h2>
            <p className="mt-2 text-[14px] text-steel">
              {row.count} {row.count === 1 ? 'sharpener' : 'sharpeners'} catalogued
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-12 rounded-[10px] border border-hair bg-white p-8">
        <h2 className="font-heading text-xl font-bold text-ink">Join the collectors</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-steel">
          Sharpeners are recorded with the collector ID of the person who owns them. Sign in to
          keep your own ID against the pieces in your collection, and the archive stays accurate as
          items change hands.
        </p>
      </div>
    </div>
  );
}