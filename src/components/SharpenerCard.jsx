import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { sharpenerImage, typeCountryLine } from '@/lib/archive';

export default function SharpenerCard({ sharpener }) {
  return (
    <Link
      to={`/sharpener/${sharpener.id}`}
      className="group block overflow-hidden rounded-[10px] border border-hair bg-white transition-colors duration-200 hover:border-oxblood"
    >
      <div className="aspect-square overflow-hidden bg-frost">
        <Image
          src={sharpenerImage(sharpener)}
          alt={sharpener.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
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