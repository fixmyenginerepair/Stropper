import { Link } from 'react-router-dom';
import { TYPE_GROUPS } from '@/lib/archive';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// The archive's families, set out like the departments of a trade catalogue.
export default function TypeGrid() {
  return (
    <section className="archive-container py-16 sm:py-20 lg:py-24">
      <div className="text-center">
        <p className="eyebrow text-oxblood">The departments</p>
        <h2 className="mt-3 font-heading text-[2.2rem] font-bold text-ink sm:text-5xl">
          Browse <span className="italic font-normal">by</span> kind
        </h2>
        <div className="ornament-rule mx-auto mt-5 max-w-xs">
          <span className="font-fell text-xl leading-none">❦</span>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 border-t border-ink/70 sm:grid-cols-2 lg:grid-cols-4">
        {TYPE_GROUPS.map((group, i) => (
          <Link
            key={group.label}
            to={`/browse?type=${encodeURIComponent(group.match)}`}
            className="group relative border-b border-ink/25 p-6 transition-colors hover:bg-paper sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0"
          >
            <span className="font-fell text-[13px] uppercase tracking-[0.25em] text-brass">Dept. {ROMAN[i]}</span>
            <h3 className="mt-2 font-heading text-[1.6rem] font-bold leading-tight text-ink transition-colors group-hover:text-oxblood">
              {group.label}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-steel">{group.blurb}</p>
            <span className="mt-4 inline-block font-heading text-[15px] italic text-oxblood opacity-0 transition-opacity group-hover:opacity-100">
              Enter the department →
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link to="/browse" className="font-heading text-[17px] italic text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">
          or see all {`sharpeners`} in the archive
        </Link>
      </div>
    </section>
  );
}
