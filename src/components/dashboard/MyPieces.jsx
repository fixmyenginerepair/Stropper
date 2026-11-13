import { useState } from 'react';
import { Link } from 'react-router-dom';
import SharpenerCard from '@/components/SharpenerCard';

const SHOW = 24;

export default function MyPieces({ name, pieces, total, loading }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? pieces : pieces.slice(0, SHOW);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-2 border-b border-hair pb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <h2 className="font-heading text-xl font-bold text-ink">
          Your items in the archive{' '}
          {!loading && <span className="text-steel">({total})</span>}
        </h2>
        {name && (
          <Link
            to={`/browse?collector=${encodeURIComponent(name)}`}
            className="text-[13px] font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
          >
            Search the whole archive
          </Link>
        )}
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
          <div className="h-40 animate-pulse rounded-[10px] bg-white" />
          <div className="h-40 animate-pulse rounded-[10px] bg-white" />
          <div className="h-40 animate-pulse rounded-[10px] bg-white" />
        </div>
      ) : total === 0 ? (
        <p className="mt-6 rounded-[10px] border border-hair bg-white p-6 text-[14px] leading-relaxed text-steel">
          No pieces are recorded under your name yet. Entries are attributed through the
          &ldquo;Collection&rdquo; field on each sharpener — email the webmaster with photographs and
          they will be added and linked to you.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
            {shown.map((sharpener) => (
              <SharpenerCard key={sharpener.id} sharpener={sharpener} />
            ))}
          </div>
          {pieces.length > SHOW && !showAll && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAll(true)}
                className="rounded-lg border border-hair bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-oxblood hover:text-oxblood"
              >
                Show all {pieces.length}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}