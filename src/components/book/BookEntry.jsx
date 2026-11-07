import { Image } from '@/components/ui/image';
import { formatValue, rarityLabel, sharpenerImage } from '@/lib/archive';

const Line = ({ label, value }) => (
  <div className="flex gap-2 border-b border-hair py-1.5 text-[13px] last:border-0">
    <span className="w-32 shrink-0 font-semibold uppercase tracking-[0.08em] text-steel text-[10px] pt-1">
      {label}
    </span>
    <span className={value ? 'text-ink' : 'text-steel'}>{value || 'Not recorded'}</span>
  </div>
);

export default function BookEntry({ sharpener, index }) {
  return (
    <article className="book-entry rounded-[10px] border border-hair bg-white p-6 print:rounded-none print:border-0 print:p-0">
      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <div className="overflow-hidden rounded-lg bg-frost">
          <Image
            src={sharpenerImage(sharpener)}
            alt={sharpener.name}
            className="aspect-square w-full object-cover"
          />
        </div>
        <div>
          <p className="eyebrow text-oxblood">
            {String(index).padStart(3, '0')} · {[sharpener.type, sharpener.country].filter(Boolean).join(' · ')}
          </p>
          <h3 className="mt-2 font-heading text-xl font-bold text-ink">{sharpener.name}</h3>
          {sharpener.description && (
            <p className="mt-2 text-[13px] leading-relaxed text-steel">{sharpener.description}</p>
          )}
          <div className="mt-4">
            <Line label="Manufacturer" value={sharpener.manufacturer} />
            <Line label="Type" value={sharpener.type} />
            <Line label="Country" value={sharpener.country} />
            <Line label="Patent" value={sharpener.patent} />
            <Line label="Blade" value={sharpener.blade} />
            <Line
              label="Rarity"
              value={sharpener.rarity ? `${sharpener.rarity} — ${rarityLabel(sharpener.rarity)}` : ''}
            />
            <Line label="Value" value={formatValue(sharpener.value)} />
            <Line label="Collection" value={sharpener.collection} />
            <Line label="Comment" value={sharpener.comment} />
          </div>
        </div>
      </div>
    </article>
  );
}