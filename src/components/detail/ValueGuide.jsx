import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ValueRangeBar from '@/components/detail/ValueRangeBar';
import { buildValueGuide, money, standingNote } from '@/lib/valueGuide';

function Stat({ label, children }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-steel">{label}</dt>
      <dd className="mt-0.5 font-heading text-base font-bold text-ink">{children}</dd>
    </div>
  );
}

export default function ValueGuide({ sharpener }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!sharpener?.type) return undefined;
    let cancelled = false;
    setRows(null);
    base44.entities.Sharpener.filter({ type: sharpener.type }, { sort: 'value', limit: 300 })
      .then((page) => !cancelled && setRows(page.items || []))
      .catch(() => !cancelled && setRows([]));
    return () => { cancelled = true; };
  }, [sharpener?.type, sharpener?.id]);

  if (!sharpener?.type) return null;

  const guide = buildValueGuide(sharpener, rows);
  const note = standingNote(guide, sharpener.type);
  const loading = rows === null;

  return (
    <section className="mt-4 rounded-[10px] border border-hair bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">Price range guide</p>
        {!loading && guide.count > 0 && (
          <p className="text-[12px] text-steel">
            {guide.count} comparable {guide.count === 1 ? 'piece' : 'pieces'}
          </p>
        )}
      </div>

      {loading ? (
        <div className="mt-3 h-14 animate-pulse rounded bg-frost" />
      ) : guide.low !== null ? (
        <>
          <p className="mt-2 font-heading text-2xl font-bold text-ink">
            {money(guide.low)} – {money(guide.high)}
          </p>
          <p className="text-[12.5px] text-steel">
            {guide.source === 'curated'
              ? 'Recorded range for this piece'
              : `Middle half of recorded values for ${sharpener.type}`}
          </p>
          <ValueRangeBar {...guide} />
          <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-hair pt-4 sm:grid-cols-3">
            <Stat label="Median">{guide.median ? money(guide.median) : '—'}</Stat>
            <Stat label="This piece">{guide.value ? money(guide.value) : 'Not recorded'}</Stat>
            <Stat label="Recorded">{guide.count || 'None yet'}</Stat>
          </dl>
          {note && <p className="mt-3 text-[12.5px] leading-relaxed text-ink/75">{note}</p>}
        </>
      ) : (
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink/80">
          {guide.count
            ? `Only ${guide.count} recorded value${guide.count === 1 ? '' : 's'} for ${sharpener.type} so far, not enough for a range. It fills in as more pieces are catalogued.`
            : `No recorded values for ${sharpener.type} in the archive yet, so there is nothing to compare this piece against.`}
        </p>
      )}

      <p className="mt-3 border-t border-hair pt-3 text-[11.5px] leading-relaxed text-steel">
        A guide only, drawn from values recorded in this archive. Not live sale prices or a formal appraisal.
      </p>
    </section>
  );
}