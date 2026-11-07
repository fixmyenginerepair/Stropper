import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SHARPENER_TYPES, TYPE_BLURBS } from '@/lib/archive';

export default function TypeGrid() {
  return (
    <section className="archive-container py-16 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-oxblood">The categories</p>
          <h2 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.1rem]">
            Browse by type
          </h2>
        </div>
        <Link
          to="/browse"
          className="text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
        >
          See all sharpeners
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHARPENER_TYPES.map((type) => (
          <Link
            key={type}
            to={`/browse?type=${encodeURIComponent(type)}`}
            className="group flex items-start justify-between gap-4 rounded-[10px] border border-hair bg-white p-5 transition-colors hover:border-oxblood"
          >
            <div>
              <h3 className="font-heading text-[17px] font-bold text-ink">{type}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-steel">{TYPE_BLURBS[type]}</p>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-steel transition-colors group-hover:text-oxblood" />
          </Link>
        ))}
      </div>
    </section>
  );
}