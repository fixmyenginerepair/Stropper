import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { RARITY_LABELS, sharpenerImage, typeCountryLine } from '@/lib/archive';
import { sharpenerPath } from '@/lib/slugs';

export default function WantedCard({ sharpener }) {
  return (
    <Link
      to={sharpenerPath(sharpener)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-hair bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-oxblood/40 hover:shadow-[0_18px_40px_-24px_rgba(27,35,51,0.45)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-frost">
        <Image
          src={sharpenerImage(sharpener)}
          alt={sharpener.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
        <span className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink/85 font-heading text-[16px] font-bold text-white backdrop-blur-sm">
          {sharpener.rarity}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-oxblood">
          {RARITY_LABELS[sharpener.rarity] || 'Unrated'}
        </p>
        <h3 className="mt-1.5 font-heading text-[16px] font-bold leading-snug text-ink">
          {sharpener.name}
        </h3>
        <p className="mt-1 text-[13px] text-steel">{typeCountryLine(sharpener) || 'Sharpener'}</p>
      </div>
    </Link>
  );
}