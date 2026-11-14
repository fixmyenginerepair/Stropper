import { money } from '@/lib/valueGuide';

export default function ValueRangeBar({ low, high, median, value, max }) {
  const pct = (n) =>
    max > 0 ? Math.min(100, Math.max(0, (Number(n) / max) * 100)) : 0;

  return (
    <div className="mt-5">
      <div className="relative h-1.5 rounded-full bg-frost">
        <div
          className="absolute inset-y-0 rounded-full bg-oxblood/20"
          style={{ left: `${pct(low)}%`, width: `${Math.max(pct(high) - pct(low), 1.5)}%` }}
        />
        {median !== null && (
          <span
            className="absolute -top-[3px] h-3 w-px bg-oxblood/50"
            style={{ left: `${pct(median)}%` }}
            aria-hidden="true"
          />
        )}
        {value !== null && (
          <span
            className="absolute -top-[5px] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-oxblood shadow-sm"
            style={{ left: `${pct(value)}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-steel">
        <span>{money(0)}</span>
        <span className="flex items-center gap-3">
          {value !== null && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-oxblood" /> this piece
            </span>
          )}
          {median !== null && (
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-px bg-oxblood/50" /> median
            </span>
          )}
        </span>
        <span>{money(max)}</span>
      </div>
    </div>
  );
}