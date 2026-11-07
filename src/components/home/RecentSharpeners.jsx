import { Link } from 'react-router-dom';
import SharpenerCard from '@/components/SharpenerCard';
import { SAMPLE_SHARPENERS } from '@/lib/sampleSharpeners';

export default function RecentSharpeners() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="archive-container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-oxblood">Latest additions</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.1rem]">
              Recently catalogued
            </h2>
          </div>
          <Link
            to="/browse?sort=updated"
            className="text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
          >
            Recently updated
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {SAMPLE_SHARPENERS.slice(0, 4).map((sharpener) => (
            <SharpenerCard key={sharpener.id} sharpener={sharpener} />
          ))}
        </div>
      </div>
    </section>
  );
}