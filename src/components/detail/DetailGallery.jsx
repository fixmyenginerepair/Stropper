import { useState } from 'react';
import { Image } from '@/components/ui/image';
import { sharpenerImage } from '@/lib/archive';

export default function DetailGallery({ sharpener }) {
  const images = sharpener.images?.length
    ? sharpener.images.slice(0, 4)
    : [sharpenerImage(sharpener)];

  const [active, setActive] = useState(0);
  const main = images[active] || images[0];

  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-hair bg-white">
        <div className="aspect-[4/3] w-full bg-frost">
          <Image
            key={main}
            src={main}
            alt={sharpener.name}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {images.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`View photo ${index + 1}`}
            className={`overflow-hidden rounded-lg border bg-white transition-colors ${
              index === active ? 'border-oxblood' : 'border-hair hover:border-oxblood/60'
            }`}
          >
            <Image src={src} alt="" className="aspect-square w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}