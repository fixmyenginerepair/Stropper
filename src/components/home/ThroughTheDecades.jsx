import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ERAS, loadAds, loadPatents, patentYear, SHARPENER_CARD_FIELDS } from '@/lib/eras';
import { patentLabel } from '@/lib/patents';
import { sharpenerPath } from '@/lib/slugs';

const SHOW_PIECES = 6;

// Groups every patent (and the pieces that carry it) by decade.
function useDecades() {
  const [data, setData] = useState(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadPatents(), loadAds()]).then(([patents, ads]) => {
      if (cancelled) return;
      const byDecade = new Map(ERAS.map((e) => [e.decade, { patents: [], pieceIds: new Set(), ads: [] }]));
      // Date each piece by the earliest patent it carries.
      const first = new Map();
      patents.forEach((p) => {
        const y = patentYear(p);
        if (!y) return;
        (p.sharpener_ids || []).forEach((id) => {
          if (!first.has(id) || y < first.get(id)) first.set(id, y);
        });
        byDecade.get(Math.floor(y / 10) * 10)?.patents.push(p);
      });
      first.forEach((y, id) => byDecade.get(Math.floor(y / 10) * 10)?.pieceIds.add(id));
      ads.forEach((a) => {
        if (a.year && a.image) byDecade.get(Math.floor(a.year / 10) * 10)?.ads.push(a);
      });
      setData(byDecade);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return data;
}

function DecadeRail({ data, selected, onSelect }) {
  const max = Math.max(1, ...ERAS.map((e) => data?.get(e.decade)?.pieceIds.size || 0));
  return (
    <div role="tablist" aria-label="Choose a decade" className="grid grid-cols-4 gap-px border border-white/20 bg-white/20 sm:grid-cols-8">
      {ERAS.map((era) => {
        const n = data?.get(era.decade)?.pieceIds.size || 0;
        const active = era.decade === selected;
        return (
          <button
            key={era.decade}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(era.decade)}
            className={`group relative flex h-28 flex-col justify-end overflow-hidden px-3 pb-3 text-left transition-colors sm:h-36 ${
              active ? 'bg-paper text-ink' : 'bg-navy text-white hover:bg-[#0c0b7a]'
            }`}
          >
            {/* Bar: how many pieces in the archive date from this decade. */}
            <span
              aria-hidden="true"
              className={`absolute bottom-0 left-0 w-1.5 transition-all duration-700 ${active ? 'bg-oxblood' : 'bg-brass/70 group-hover:bg-brass'}`}
              style={{ height: `${Math.max(6, (n / max) * 100)}%` }}
            />
            <span className={`font-heading text-[1.6rem] font-bold leading-none sm:text-[1.9rem] ${active ? '' : 'text-white/90'}`}>
              {era.decade}
              <span className="italic font-normal">s</span>
            </span>
            <span className={`mt-1 font-ui text-[11px] ${active ? 'text-steel' : 'text-white/50'}`}>
              {data ? `${n} piece${n === 1 ? '' : 's'}` : '…'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function usePieces(ids) {
  const [pieces, setPieces] = useState(null);
  const key = ids.join(',');
  useEffect(() => {
    let cancelled = false;
    setPieces(null);
    if (!ids.length) {
      setPieces([]);
      return undefined;
    }
    base44.entities.Sharpener.filter({ id: { $in: ids } }, '-rarity', ids.length, 0, SHARPENER_CARD_FIELDS)
      .then((rows) => {
        if (!cancelled) setPieces((rows || []).filter((s) => s.images?.length).slice(0, SHOW_PIECES));
      })
      .catch(() => !cancelled && setPieces([]));
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return pieces;
}

export default function ThroughTheDecades() {
  const data = useDecades();
  const [selected, setSelected] = useState(1920);
  const era = ERAS.find((e) => e.decade === selected);
  const bucket = data?.get(selected);

  // A spread of pieces from the decade (pieces with a photo are picked from these).
  const sampleIds = useMemo(() => [...(bucket?.pieceIds || [])].slice(0, 40), [bucket]);
  const pieces = usePieces(sampleIds);
  const drawing = useMemo(
    () => (bucket?.patents || []).find((p) => p.drawing_urls?.length && p.title) || (bucket?.patents || []).find((p) => p.drawing_urls?.length),
    [bucket],
  );
  const ad = bucket?.ads?.[0];

  return (
    <section id="decades" className="scroll-mt-20 bg-navy text-white">
      <div className="rope-rule rope-rule--light opacity-60" />
      <div className="archive-container py-16 sm:py-20 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="eyebrow text-brass">Through the decades</p>
            <h2 className="text-balance mt-3 max-w-3xl font-heading text-[2.2rem] font-bold leading-[1.05] sm:text-5xl">
              A century of keeping <span className="italic font-normal text-[#e9c98f]">the edge</span>
            </h2>
          </div>
          <p className="max-w-md text-[17px] leading-relaxed text-white/70">
            Every piece is dated by the patent stamped on it. Pick a decade to meet the machines, the inventors and the
            advertising of the time.
          </p>
        </div>

        <div className="mt-10">
          <DecadeRail data={data} selected={selected} onSelect={setSelected} />
        </div>

        {era && (
          <div key={selected} className="decade-in mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <style>{`
              .decade-in{animation:decade-in .6s ease both}
              @keyframes decade-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
              @media (prefers-reduced-motion: reduce){.decade-in{animation:none}}
            `}</style>
            <div>
              <p className="font-heading text-[5.5rem] font-black leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_rgba(233,201,143,.75)] sm:text-[8rem]">
                {selected}s
              </p>
              <h3 className="mt-5 font-heading text-3xl font-bold">{era.name}</h3>
              <p className="drop-cap drop-cap-light mt-4 text-[18px] leading-relaxed text-white/80">{era.story}</p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-ui text-[14px] text-white/60">
                <span>
                  <strong className="text-white">{bucket?.pieceIds.size ?? '…'}</strong> pieces
                </span>
                <span>
                  <strong className="text-white">{bucket?.patents.length ?? '…'}</strong> patents
                </span>
                {bucket?.ads.length > 0 && (
                  <span>
                    <strong className="text-white">{bucket.ads.length}</strong> period ads
                  </span>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/patents?decade=${selected}`}
                  className="inline-flex items-center gap-2 bg-paper px-5 py-3 font-fell text-[13px] font-bold uppercase tracking-[0.14em] text-ink shadow-[4px_4px_0_#680000] transition-transform hover:-translate-y-0.5"
                >
                  The {selected}s patents <ArrowRight className="h-4 w-4" />
                </Link>
                {bucket?.ads.length > 0 && (
                  <Link
                    to="/advertising"
                    className="inline-flex items-center gap-2 border-2 border-white/60 px-5 py-3 font-fell text-[13px] font-bold uppercase tracking-[0.14em] text-white hover:border-white"
                  >
                    Ads of the era
                  </Link>
                )}
              </div>

              {drawing && (
                <Link to={`/patents/${drawing.id}`} className="group mt-10 block bg-paper p-4 text-ink shadow-[0_0_0_1px_rgba(233,201,143,.6)]">
                  <div className="relative aspect-[5/3] overflow-hidden">
                    <img src={drawing.drawing_urls[0]} alt={`Drawing for ${patentLabel(drawing)}`} loading="lazy" className="ink-on-paper h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 flex items-baseline justify-between gap-3 border-t border-ink/60 pt-2">
                    <span className="font-heading text-[15px] italic">{drawing.title || 'Patent drawing'}</span>
                    <span className="shrink-0 font-fell text-[12px] uppercase tracking-[0.2em] text-oxblood">
                      {patentLabel(drawing)} · {patentYear(drawing)}
                    </span>
                  </p>
                </Link>
              )}
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {pieces === null
                  ? Array.from({ length: SHOW_PIECES }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-white/10" />)
                  : pieces.map((s, i) => (
                      <Link
                        key={s.id}
                        to={sharpenerPath(s)}
                        className={`group relative block overflow-hidden bg-paper ${i === 0 ? 'col-span-2 row-span-2 sm:col-span-2' : ''}`}
                      >
                        <img src={s.images[0]} alt={s.name} loading="lazy" className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-10">
                          <span className="block font-heading text-[15px] font-bold leading-tight text-white">{s.name}</span>
                          <span className="font-ui text-[11px] text-white/70">{[s.type, s.country].filter(Boolean).join(' · ')}</span>
                        </span>
                      </Link>
                    ))}
              </div>

              {ad && (
                <Link to={`/advertising?ad=${ad.id}`} className="group mt-6 flex items-center gap-5 border-t border-white/20 pt-6">
                  <img src={ad.image} alt="" loading="lazy" className="h-28 w-24 shrink-0 object-cover sepia-[.3] transition group-hover:sepia-0" />
                  <span>
                    <span className="eyebrow block text-brass">In the magazines · {ad.year}</span>
                    <span className="mt-1 block font-heading text-[19px] italic leading-snug">“{ad.title}”</span>
                    <span className="mt-1 block font-ui text-[13px] text-white/60">{ad.brand}</span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="rope-rule rope-rule--light opacity-60" />
    </section>
  );
}
