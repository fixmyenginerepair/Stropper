import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { patentLabel } from '@/lib/patents';

const MAX_PATENTS = 6;

const yearOf = (patent) =>
  patent.year ||
  (patent.grant_date ? Number(String(patent.grant_date).slice(0, 4)) : null) ||
  null;

function buildEvents(maker, patents, pieces) {
  const events = [];

  events.push({
    key: 'founded',
    year: maker.founded_year || null,
    label: 'Founded',
    detail:
      [maker.key_people, [maker.city, maker.country].filter(Boolean).join(', ')]
        .filter(Boolean)
        .join(' · ') || null,
    accent: true,
  });

  patents
    .map((patent) => ({ patent, year: yearOf(patent) }))
    .filter((entry) => entry.year)
    .sort((a, b) => a.year - b.year)
    .slice(0, MAX_PATENTS)
    .forEach(({ patent, year }) => {
      events.push({
        key: `patent-${patent.id}`,
        year,
        label: patent.title || 'Patent granted',
        detail: patent.number ? `Patent ${patentLabel(patent)}` : null,
        to: `/patents/${patent.id}`,
      });
    });

  const madeYears = (pieces || []).map((piece) => piece.year_made).filter(Boolean);
  if (madeYears.length) {
    events.push({
      key: 'earliest-piece',
      year: Math.min(...madeYears),
      label: 'Earliest dated piece in the archive',
      detail: 'The oldest surviving example by this maker catalogued here.',
    });
  }

  events.push({
    key: 'closed',
    year: maker.closed_year || null,
    label: maker.closed_year ? 'Ceased trading' : 'Closing year not recorded',
    detail: maker.closed_year
      ? 'The end of the maker’s production.'
      : 'The archive has not yet established when this maker closed.',
    muted: !maker.closed_year,
    accent: Boolean(maker.closed_year),
  });

  return events
    .map((event) => ({
      ...event,
      sortKey: event.year ?? (event.key === 'founded' ? -Infinity : Infinity),
    }))
    .sort((a, b) => a.sortKey - b.sortKey);
}

export default function MakerTimeline({ maker, pieces }) {
  const [patents, setPatents] = useState([]);

  useEffect(() => {
    let cancelled = false;
    base44.entities.Patent.filter({ maker_id: maker.id }, 'year', 50)
      .then((rows) => !cancelled && setPatents(rows || []))
      .catch(() => !cancelled && setPatents([]));
    return () => {
      cancelled = true;
    };
  }, [maker.id]);

  const events = buildEvents(maker, patents, pieces);

  return (
    <section className="mt-10 max-w-[720px]">
      <div className="flex items-baseline justify-between gap-4 border-b border-hair pb-3">
        <h2 className="font-heading text-xl font-bold text-ink">Timeline</h2>
        <p className="text-[12px] text-steel">Dated from the archive’s records</p>
      </div>

      <ol className="mt-6 space-y-0">
        {events.map((event, index) => {
          const last = index === events.length - 1;
          return (
            <li key={event.key} className="flex gap-4">
              <div className="flex w-3 shrink-0 flex-col items-center" aria-hidden="true">
                <span
                  className={`mt-[7px] h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                    event.muted
                      ? 'border border-steel/50 bg-white'
                      : event.accent
                        ? 'bg-oxblood'
                        : 'bg-navy'
                  }`}
                />
                {!last && <span className="mt-1 w-px flex-1 bg-hair" />}
              </div>

              <div className={`min-w-0 flex-1 ${last ? 'pb-0' : 'pb-7'}`}>
                <p
                  className={`font-mono text-[12px] font-semibold tracking-[0.08em] ${
                    event.muted ? 'text-steel' : 'text-oxblood'
                  }`}
                >
                  {event.year || 'Year not recorded'}
                </p>
                <p
                  className={`mt-1 font-heading text-[16.5px] font-bold leading-snug ${
                    event.muted ? 'text-steel' : 'text-ink'
                  }`}
                >
                  {event.to ? (
                    <Link to={event.to} className="hover:text-oxblood hover:underline">
                      {event.label}
                    </Link>
                  ) : (
                    event.label
                  )}
                </p>
                {event.detail && (
                  <p className="mt-1 text-[13.5px] leading-relaxed text-steel">{event.detail}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}