import { useState } from 'react';
import { Link } from 'react-router-dom';
import SharpenerCard from '@/components/SharpenerCard';

const SHOW = 24;

export default function CollectorPieces({ name, pieces, total }) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? pieces : pieces.slice(0, SHOW);
  const browseHref = `/browse?collector=${encodeURIComponent(name)}`;

  return (
    <section>
      <div className="flex flex-col gap-2 border-b border-hair pb-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <h2 className="font-heading text-xl font-bold text-ink">
          In the archive <span className="text-steel">({total})</span>
        </h2>
        <Link
          to={browseHref}
          className="text-[13px] font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
        >
          Browse pieces under this name
        </Link>
      </div>

      {total === 0 ? (
        <p className="mt-6 rounded-[10px] border border-hair bg-white p-8 text-center text-[14px] leading-relaxed text-steel">
          No individual pieces are recorded under this collector’s name yet — much of the archive is
          catalogued without an owner.{' '}
          <Link to={browseHref} className="font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">
            Search the archive
          </Link>{' '}
          to see what is listed.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
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