import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { formatValue, sharpenerImage } from '@/lib/archive';

const listValue = (value) => {
  const formatted = formatValue(value);
  return formatted === 'Not recorded' ? '' : formatted;
};

// Phone view of the full list: one tappable row per sharpener.
export default function SharpenerCards({ items, loading, startIndex }) {
  if (loading) {
    return (
      <p className="px-4 py-10 text-center text-sm text-steel md:hidden">Loading the list…</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-steel md:hidden">
        No sharpeners have been recorded yet.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-hair/70 md:hidden">
      {items.map((item, index) => {
        const value = listValue(item.value);
        const meta = [item.country, item.type].filter(Boolean).join(' · ');

        return (
          <li key={item.id}>
            <Link
              to={`/sharpener/${item.id}`}
              className="flex gap-3 px-4 py-3 transition-colors active:bg-frost/70"
            >
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded border border-hair bg-frost">
                <Image
                  src={sharpenerImage(item)}
                  alt={item.name || 'Sharpener'}
                  loading="lazy"
                  className="h-14 w-14 object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] text-steel">
                  {startIndex + index + 1}
                </span>
                <span className="block text-[14px] font-medium leading-snug text-ink">
                  {item.description || item.name}
                </span>
                {meta && <span className="mt-0.5 block text-[12px] text-steel">{meta}</span>}
                {(item.rarity || value) && (
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-[12px]">
                    {item.rarity && (
                      <span className="rounded border border-hair px-1.5 py-0.5 text-steel">
                        Rarity {item.rarity}
                      </span>
                    )}
                    {value && <span className="font-semibold text-ink">{value}</span>}
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}