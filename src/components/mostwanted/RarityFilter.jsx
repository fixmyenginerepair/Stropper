import { RARITY_LABELS } from '@/lib/archive';

export default function RarityFilter({ levels, counts, total, active, onToggle }) {
  return (
    <div className="flex flex-col gap-4 border-b border-hair pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex rounded-xl border border-hair bg-white p-1">
        {levels.map((level) => {
          const on = active.includes(level);
          return (
            <button
              key={level}
              type="button"
              onClick={() => onToggle(level)}
              aria-pressed={on}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors sm:px-4 ${
                on ? 'bg-navy text-white' : 'text-ink hover:bg-frost'
              }`}
            >
              <span>{level}</span>
              <span className={`hidden sm:inline ${on ? 'text-white/60' : 'text-steel'}`}>
                {RARITY_LABELS[level]}
              </span>
              {counts && (
                <span className={`text-[11px] ${on ? 'text-white/70' : 'text-steel'}`}>
                  {counts[level] || 0}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[13px] text-steel">
        <strong className="font-semibold text-ink">{total}</strong> pieces in view
      </p>
    </div>
  );
}