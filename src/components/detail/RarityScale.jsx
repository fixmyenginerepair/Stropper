import { rarityBand, raritySegments } from '@/lib/archive';

export default function RarityScale({ rarity, label }) {
  const filled = raritySegments(rarity);
  const band = rarityBand(rarity);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">Rarity</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading text-4xl font-bold leading-none text-ink">
          {rarity || '—'}
        </span>
        <span className="text-[13px] text-steel">{label}</span>
      </div>

      <p className="mt-3">
        <span className="inline-flex items-center rounded-full bg-oxblood px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          {band ? `${band.label} band` : 'Not rated'}
        </span>
        {band && (
          <span className="ml-2 text-[12px] text-steel">scale {band.range}</span>
        )}
      </p>

      <div className="mt-3 flex gap-1" aria-hidden="true">
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 flex-1 rounded-full ${index < filled ? 'bg-oxblood' : 'bg-frost'}`}
          />
        ))}
      </div>
    </div>
  );
}