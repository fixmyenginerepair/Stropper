import { rarityBand, rarityLabel } from '@/lib/archive';

// The coarse band a rating falls into (Common / Rare / Unique / Trade).
export default function RarityBandBadge({ rarity, className = '' }) {
  const band = rarityBand(rarity);
  if (!band) return null;

  return (
    <span
      title={rarityLabel(rarity)}
      className={`inline-flex items-center rounded-full bg-oxblood px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white ${className}`}
    >
      {band.label}
    </span>
  );
}