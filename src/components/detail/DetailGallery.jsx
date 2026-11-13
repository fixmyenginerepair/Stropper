import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { sharpenerImage } from '@/lib/archive';
import PhotoZoom from '@/components/detail/PhotoZoom';

export default function DetailGallery({ sharpener }) {
  const images = sharpener.images?.length
    ? sharpener.images.slice(0, 4)
    : [sharpenerImage(sharpener)];

  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const main = images[active] || images[0];

  return (
    <div>
      <div className="overflow-hidden rounded-[10px] border border-hair bg-white">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`Enlarge photo of ${sharpener.name}`}
          className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden bg-frost"
        >
          <Image
            key={main}
            src={main}
            alt={sharpener.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-lg bg-ink/75 px-3 py-2 text-[12px] font-semibold text-white">
            <Maximize2 className="h-3.5 w-3.5" /> Inspect up close
          </span>
        </button>
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

      {zoomed && (
        <PhotoZoom src={main} alt={sharpener.name} onClose={() => setZoomed(false)} />
      )}
    </div>
  );
}