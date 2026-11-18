import { NOW_YEAR, thenAndNow } from '@/lib/inflation';

const yearText = (t) => `${t.approx ? 'c. ' : ''}${t.year}`;

// "Then / Now" price box for a period ad.
//  variant="chip": one line for gallery cards.
//  variant="panel": the full box with a note on how it was worked out.
export default function ThenNow({ ad, variant = 'panel', className = '' }) {
  const t = thenAndNow(ad);
  if (!t) return null;

  if (variant === 'chip') {
    return (
      <p className={`flex flex-wrap items-baseline gap-x-1.5 text-[13px] ${className}`}>
        <span className="font-semibold text-ink">{t.printed}</span>
        {t.todayText && (
          <>
            <span className="text-steel">then ·</span>
            <span className="font-semibold text-oxblood">≈ {t.todayText}</span>
            <span className="text-steel">now</span>
          </>
        )}
      </p>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[10px] border border-dashed border-oxblood/45 bg-[#fbf8f1] ${className}`}>
      <div className="flex items-baseline justify-between gap-3 bg-navy px-4 py-2">
        <h3 className="font-heading text-[17px] font-bold leading-tight text-white">Then &amp; Now</h3>
        <span className="text-right text-[11px] leading-tight text-white/70">What it cost, in today’s money</span>
      </div>
      <div className="grid grid-cols-2 divide-x divide-dashed divide-oxblood/30">
        <div className="min-w-0 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-oxblood">Then · {yearText(t)}</p>
          <p className="mt-1 font-heading text-[1.6rem] font-bold leading-none text-ink">{t.printed}</p>
          {t.item && <p className="mt-1.5 break-words text-[13px] leading-snug text-steel">{t.item}</p>}
        </div>
        <div className="min-w-0 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-navy">Now · {NOW_YEAR}</p>
          {t.todayText ? (
            <>
              <p className="mt-1 font-heading text-[1.6rem] font-bold leading-none text-navy">≈ {t.todayText}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-steel">in today’s money</p>
            </>
          ) : (
            <p className="mt-2 text-[13px] leading-snug text-steel">No price index for this currency yet.</p>
          )}
        </div>
      </div>
      {t.todayText && (
        <p className="border-t border-dashed border-oxblood/30 px-4 py-2 text-[11.5px] leading-snug text-steel">
          Adjusted for inflation with the {t.source}.
          {t.currency === 'GBP' && ' Old British money: 12 pence (d) to a shilling (s), 20 shillings to the pound; 21/- is 21 shillings.'}
        </p>
      )}
    </div>
  );
}
