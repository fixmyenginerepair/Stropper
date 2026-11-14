import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import SharpenerTypeBadge from '@/components/SharpenerTypeBadge';
import { sharpenerImage, typeCountryLine } from '@/lib/archive';

export default function SharpenerCard({ sharpener, showType = false }) {
  return (
    <Link
      to={`/sharpener/${sharpener.id}`}
      className="group block overflow-hidden rounded-[10px] border border-hair bg-white transition-colors duration-200 hover:border-oxblood"
    >
      <div className="relative aspect-square overflow-hidden bg-frost">
        <Image
          src={sharpenerImage(sharpener)}
          alt={sharpener.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {showType && (
          <SharpenerTypeBadge type={sharpener.type} className="absolute left-2 top-2 z-10" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-[15px] font-bold leading-snug text-ink">
          {sharpener.name}
        </h3>
        <p className="mt-1 text-[13px] text-steel">{typeCountryLine(sharpener)}</p>
      </div>
    </Link>
  );
}