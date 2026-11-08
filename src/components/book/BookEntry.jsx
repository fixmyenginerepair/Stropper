import { formatValue, rarityLabel, sharpenerImage } from '@/lib/archive';

const Line = ({ label, value }) => (
  <div className="flex gap-2 border-b border-hair py-1.5 text-[13px] last:border-0">
    <span className="w-32 shrink-0 font-semibold uppercase tracking-[0.08em] text-steel text-[10px] pt-1">
      {label}
    </span>
    <span className={value ? 'text-ink' : 'text-steel'}>{value || 'Not recorded'}</span>
  </div>
);

// Compact rows skip empty fields so several entries fit on one printed page.
const CompactLine = ({ label, value }) =>
  value ? (
    <div className="flex gap-1.5 text-[11px] leading-snug">
      <span className="shrink-0 font-semibold uppercase tracking-[0.06em] text-steel text-[9px] pt-[1px]">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  ) : null;

function CompactEntry({ sharpener, index }) {
  const rarity = sharpener.rarity ? `${sharpener.rarity} — ${rarityLabel(sharpener.rarity)}` : '';
  return (
    <article className="book-entry book-entry--compact flex gap-3 rounded-[10px] border border-hair bg-white p-3">
      <img
        src={sharpenerImage(sharpener)}
        alt={sharpener.name}
        loading="eager"
        className="h-24 w-24 shrink-0 rounded-md bg-frost object-cover print:h-[1.1in] print:w-[1.1in]"
      />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-oxblood">
          {String(index).padStart(4, '0')} · {[sharpener.type, sharpener.country].filter(Boolean).join(' · ')}
        </p>
        <h3 className="font-heading text-[14px] font-bold leading-tight text-ink">{sharpener.name}</h3>
        {sharpener.description && sharpener.description !== sharpener.name && (
          <p className="mt-0.5 text-[11px] leading-snug text-steel line-clamp-2">{sharpener.description}</p>
        )}
        <div className="mt-1 space-y-0.5">
          <CompactLine label="Maker" value={sharpener.manufacturer} />
          <CompactLine label="Patent" value={sharpener.patent} />
          <CompactLine label="Blade" value={sharpener.blade} />
          <CompactLine label="Rarity" value={rarity} />
          <CompactLine label="Value" value={formatValue(sharpener.value)} />
          <CompactLine label="Collection" value={sharpener.collection} />
          <CompactLine label="Note" value={sharpener.comment} />
        </div>
      </div>
    </article>
  );
}

export default function BookEntry({ sharpener, index, compact = false }) {
  if (compact) return <CompactEntry sharpener={sharpener} index={index} />;

  return (
    <article className="book-entry book-entry--full rounded-[10px] border border-hair bg-white p-6 print:rounded-none print:border-0 print:p-0">
      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <div className="overflow-hidden rounded-lg bg-frost">
          <img
            src={sharpenerImage(sharpener)}
            alt={sharpener.name}
            loading="eager"
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
