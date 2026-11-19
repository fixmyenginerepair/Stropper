import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { eraFor, loadPatents, patentYear, SHARPENER_CARD_FIELDS } from '@/lib/eras';
import { patentLabel } from '@/lib/patents';
import { sharpenerPath } from '@/lib/slugs';

// The home page opens like a 1920s press advertisement: rope border, a rhyming
// headline, giant capitals, a line drawing and a price tag in the corner.

const CHIPS = [
  { label: 'Rollers', to: '/browse?type=Rollers' },
  { label: 'Auto Strop', to: '/browse?type=Auto+Strop' },
  { label: 'Pull String', to: '/browse?type=Pull+String' },
  { label: 'Germany', to: '/browse?country=Germany' },
];

const PLATES = 8;

function shuffle(rows) {
  const a = [...rows];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pairs a patent drawing with a photograph of a piece that carries the patent.
function usePlates() {
  const [plates, setPlates] = useState([]);
  useEffect(() => {
    let cancelled = false;
    loadPatents().then(async (patents) => {
      const pool = shuffle(
        patents.filter((p) => p.drawing_urls?.length && p.sharpener_ids?.length && (patentYear(p) || 0) < 1960),
      ).slice(0, PLATES * 2);
      const ids = pool.map((p) => p.sharpener_ids[0]);
      const pieces = await base44.entities.Sharpener.filter({ id: { $in: ids } }, null, ids.length, 0, SHARPENER_CARD_FIELDS).catch(() => []);
      const byId = new Map((pieces || []).map((s) => [s.id, s]));
      const out = pool
        .map((p) => ({ patent: p, piece: byId.get(p.sharpener_ids[0]) }))
        .filter((x) => x.piece?.images?.length)
        .slice(0, PLATES);
      if (!cancelled) setPlates(out);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return plates;
}

function useCounts() {
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    Promise.all([
      base44.entities.Sharpener.count({}).catch(() => null),
      base44.entities.Maker.count({}).catch(() => null),
      base44.entities.Patent.count({}).catch(() => null),
      base44.entities.PeriodAd.count({}).catch(() => null),
    ]).then(([pieces, makers, patents, ads]) => setCounts({ pieces, makers, patents, ads }));
  }, []);
  return counts;
}

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—');

function Illustration({ plate, index, total, onPrev, onNext }) {
  const { patent, piece } = plate;
  const year = patentYear(patent);
  const era = eraFor(year);
  return (
    <div className="relative">
      {/* Inset box, as round the soap-bowl panel in the old ad. */}
      <div data-no-zoom className="relative border-2 border-[#15120e] bg-paper p-3 shadow-[6px_6px_0_#15120e]">
        <div className="relative aspect-[4/3.3] overflow-hidden">
          <img
            key={patent.id}
            src={patent.drawing_urls[0]}
            alt={`Patent drawing, ${patentLabel(patent)}`}
            className="ink-on-paper ad-fade absolute inset-0 h-full w-full object-contain"
          />
        </div>
        <Link
          key={piece.id}
          to={sharpenerPath(piece)}
          aria-label={`See ${piece.name}`}
          className="ad-fade absolute -bottom-6 -left-6 block w-[38%] border-2 border-[#15120e] bg-paper p-1.5 shadow-[5px_5px_0_#680000] transition-transform duration-300 hover:-translate-y-1 sm:-left-8"
        >
          <img src={piece.images[0]} alt={piece.name} className="aspect-square w-full object-cover" />
        </Link>
        {/* Price-tag corner: the patent year. */}
        <Link to={`/patents/${patent.id}`} className="price-tag absolute -bottom-5 -right-4 min-w-[96px] hover:bg-oxblood">
          <span className="ad-script text-[15px] leading-none">pat.</span>
          <span className="font-heading text-[2.1rem] font-black leading-none tracking-tight">{year || '—'}</span>
        </Link>
      </div>

      <div className="mt-10 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to={sharpenerPath(piece)} className="font-heading text-[1.35rem] font-extrabold leading-tight text-ink hover:text-oxblood">
            {piece.name}
          </Link>
          <p className="mt-1 font-fell text-[11px] font-semibold uppercase tracking-[0.2em] text-steel">
            {patentLabel(patent)}
            {era?.name ? ` · ${era.name}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onPrev} aria-label="Previous drawing" className="border-2 border-[#15120e] p-1.5 text-ink hover:bg-[#15120e] hover:text-paper">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1.5 font-ui text-[12px] tabular-nums text-steel">
            {index + 1}/{total}
          </span>
          <button type="button" onClick={onNext} aria-label="Next drawing" className="border-2 border-[#15120e] p-1.5 text-ink hover:bg-[#15120e] hover:text-paper">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();
  const plates = usePlates();
  const counts = useCounts();

  useEffect(() => {
    if (paused || plates.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % plates.length), 7000);
    return () => clearInterval(t);
  }, [paused, plates.length]);

  const submit = (event) => {
    event.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : '/browse');
  };
  const step = (d) => setIndex((i) => (i + d + plates.length) % plates.length);

  return (
    <section className="archive-container py-8 sm:py-12 lg:py-14">
      <style>{`
        .ad-fade{animation:ad-in .8s ease both}
        @keyframes ad-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .ad-rise > *{animation:ad-in .9s ease both}
        .ad-rise > *:nth-child(2){animation-delay:.12s}.ad-rise > *:nth-child(3){animation-delay:.24s}
        .ad-rise > *:nth-child(4){animation-delay:.36s}.ad-rise > *:nth-child(5){animation-delay:.48s}
        @media (prefers-reduced-motion: reduce){.ad-fade,.ad-rise > *{animation:none}}
      `}</style>

      <div className="rope-frame bg-[#fbf7ee]">
        <div className="grid gap-12 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14 lg:px-14 lg:py-16">
          <div className="ad-rise">
            <h1 className="text-balance font-heading text-[2.15rem] font-extrabold leading-[1.02] text-ink sm:text-[3.1rem] lg:text-[3.5rem]">
              A thousand machines
              <br />
              to keep the edge keen,
              <br />
              now each one is kept
              <br />
              <span className="ad-script font-medium text-oxblood">in the</span>
            </h1>

            <p className="ad-display mt-3 text-[3.6rem] text-ink sm:text-[5.6rem] lg:text-[6.6rem]">
              Stropper
              <span className="block text-navy">Archive</span>
            </p>

            <p className="mt-6 max-w-xl">
              <span className="ad-script text-[22px] text-oxblood">The </span>
              <span className="font-fell text-[15px] font-semibold uppercase leading-[1.7] tracking-[0.12em] text-ink">
                world’s fullest record of razor sharpeners — with the patents, makers & advertising that made them
              </span>
            </p>

            <form onSubmit={submit} className="mt-8 flex max-w-2xl flex-col gap-0 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search maker, model, patent number…"
                  aria-label="Search the archive"
                  className="h-14 w-full rounded-none border-2 border-[#15120e] bg-white pl-12 pr-4 text-[15px] text-ink placeholder:text-steel/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-oxblood sm:border-r-0"
                />
              </div>
              <button
                type="submit"
                className="h-14 rounded-none border-2 border-[#15120e] bg-[#15120e] px-7 font-fell text-[14px] font-bold uppercase tracking-[0.16em] text-paper transition-colors hover:bg-oxblood"
              >
                Search
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="ad-script text-[17px] text-steel">or try</span>
              {CHIPS.map((chip) => (
                <Link key={chip.label} to={chip.to} className="font-fell text-[13px] font-semibold uppercase tracking-[0.14em] text-ink underline decoration-oxblood decoration-2 underline-offset-4 hover:text-oxblood">
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="mx-auto w-full max-w-[460px] lg:mx-0 lg:max-w-none lg:pt-4">
            {plates.length ? (
              <Illustration plate={plates[index]} index={index} total={plates.length} onPrev={() => step(-1)} onNext={() => step(1)} />
            ) : (
              <div className="aspect-[4/3.3] animate-pulse border-2 border-[#15120e] bg-frost" />
            )}
          </div>
        </div>

        {/* Counts set as a row of price tags. */}
        <div className="border-t-2 border-[#15120e] px-6 py-6 sm:px-10 lg:px-14">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between">
            {[
              ['pieces', counts?.pieces, '/browse'],
              ['makers', counts?.makers, '/history'],
              ['patents', counts?.patents, '/patents'],
              ['period ads', counts?.ads, '/advertising'],
            ].map(([label, n, to]) => (
              <Link key={label} to={to} className="price-tag min-w-[132px] transition-colors hover:bg-oxblood">
                <span className="font-heading text-[2rem] font-black leading-none">{fmt(n)}</span>
                <span className="ad-script mt-0.5 text-[15px] leading-none text-paper/80">{label}</span>
              </Link>
            ))}
          </div>
          <p className="mt-5 text-center font-fell text-[11px] font-semibold uppercase tracking-[0.3em] text-steel">
            Stropper.com · Strops · Hones · Rollers · Stroppers · Est. by collectors, for collectors
          </p>
        </div>
      </div>
    </section>
  );
}
