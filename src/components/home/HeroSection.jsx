import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { loadPatents, patentYear, SHARPENER_CARD_FIELDS, eraFor } from '@/lib/eras';
import { patentLabel } from '@/lib/patents';
import { sharpenerPath } from '@/lib/slugs';

const CHIPS = [
  { label: 'Rollers', to: '/browse?type=Rollers' },
  { label: 'Auto Strop', to: '/browse?type=Auto+Strop' },
  { label: 'Pull String', to: '/browse?type=Pull+String' },
  { label: 'Germany', to: '/browse?country=Germany' },
];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
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

function Plate({ plate, index, total, onPrev, onNext }) {
  const { patent, piece } = plate;
  const year = patentYear(patent);
  const era = eraFor(year);
  return (
    <figure className="plate-frame p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-3 border-b border-ink/70 pb-2">
        <span className="font-fell text-[13px] uppercase tracking-[0.25em] text-ink/70">Plate {ROMAN[index] || index + 1}</span>
        <span className="font-fell text-[13px] uppercase tracking-[0.25em] text-oxblood">{year || ''}</span>
      </div>

      <div data-no-zoom className="relative mt-4 aspect-[4/3.4] overflow-hidden">
        <img
          key={patent.id}
          src={patent.drawing_urls[0]}
          alt={`Patent drawing, ${patentLabel(patent)}`}
          className="ink-on-paper plate-fade absolute inset-0 h-full w-full object-contain"
        />
        <Link
          to={sharpenerPath(piece)}
          className="plate-fade absolute bottom-0 right-0 block w-[44%] overflow-hidden rounded-[50%] border-[3px] border-paper shadow-[0_0_0_1px_#1f1a14,0_14px_30px_-12px_rgba(0,0,0,.55)] transition-transform duration-500 hover:scale-[1.03]"
          aria-label={`See ${piece.name}`}
        >
          <img src={piece.images[0]} alt={piece.name} className="aspect-[4/5] w-full object-cover" />
        </Link>
      </div>

      <figcaption className="mt-4 border-t border-ink/70 pt-3">
        <Link to={sharpenerPath(piece)} className="font-heading text-[19px] font-bold leading-snug text-ink hover:text-oxblood">
          {piece.name}
        </Link>
        <p className="mt-1 text-[14px] italic text-steel">
          {patentLabel(patent)}
          {patent.title ? ` — ${patent.title}` : ''}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <Link to={`/patents/${patent.id}`} className="text-[13px] font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">
            {era?.name ? `${era.name} · read the patent` : 'Read the patent'}
          </Link>
          <div className="flex items-center gap-1">
            <button type="button" onClick={onPrev} aria-label="Previous plate" className="rounded-full p-1.5 text-ink/70 hover:bg-ink/5 hover:text-oxblood">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-ui text-[12px] tabular-nums text-steel">
              {index + 1} / {total}
            </span>
            <button type="button" onClick={onNext} aria-label="Next plate" className="rounded-full p-1.5 text-ink/70 hover:bg-ink/5 hover:text-oxblood">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

function PlateSkeleton() {
  return (
    <div className="plate-frame p-7">
      <div className="h-4 w-24 animate-pulse rounded bg-frost" />
      <div className="mt-4 aspect-[4/3.4] animate-pulse rounded bg-frost/70" />
      <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-frost" />
    </div>
  );
}

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—');

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
    <section className="relative overflow-hidden">
      <style>{`
        .plate-fade{animation:plate-in .9s ease both}
        @keyframes plate-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){.plate-fade{animation:none}}
      `}</style>
      {/* Faint engraved sunburst behind the title. */}
      <svg aria-hidden="true" className="pointer-events-none absolute -left-40 -top-40 h-[720px] w-[720px] text-brass/[0.12]" viewBox="0 0 200 200">
        {Array.from({ length: 48 }).map((_, i) => (
          <line key={i} x1="100" y1="100" x2={100 + 100 * Math.cos((i * Math.PI) / 24)} y2={100 + 100 * Math.sin((i * Math.PI) / 24)} stroke="currentColor" strokeWidth="0.6" />
        ))}
      </svg>

      <div className="archive-container relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20">
        <div>
          <p className="eyebrow text-oxblood">A collector’s catalogue · Vol. MMXXVI</p>
          <h1 className="text-balance mt-4 font-heading text-[2.6rem] font-black leading-[0.98] text-ink sm:text-6xl lg:text-[4.6rem]">
            The World <span className="font-normal italic text-oxblood">of</span> Razor Sharpeners
          </h1>
          <div className="ornament-rule mt-6 max-w-md">
            <span className="font-fell text-xl leading-none">✦</span>
          </div>
          <p className="mt-5 max-w-xl text-[19px] leading-relaxed text-ink/80">
            Strops, hones, rollers and stroppers from the makers of a century past — each one photographed, rated, and
            tied to the patent, the company and the advertising of its day.
          </p>

          <form onSubmit={submit} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search maker, model, patent number…"
                aria-label="Search the archive"
                className="h-14 w-full rounded-none border border-ink/70 bg-paper pl-12 pr-4 text-[15px] text-ink shadow-[inset_0_1px_3px_rgba(31,26,20,.12)] placeholder:text-steel/80 focus:outline-none focus:ring-2 focus:ring-oxblood"
              />
            </div>
            <button type="submit" className="h-14 rounded-none bg-oxblood px-7 text-[15px] font-semibold tracking-wide text-white transition-colors hover:bg-oxblood-dark">
              Search the archive
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 font-heading text-[15px] italic text-steel">or try</span>
            {CHIPS.map((chip) => (
              <Link key={chip.label} to={chip.to} className="border-b border-ink/30 px-1 text-[15px] text-ink hover:border-oxblood hover:text-oxblood">
                {chip.label}
              </Link>
            ))}
          </div>

          <dl className="mt-10 grid max-w-xl grid-cols-2 border-y border-ink/70 sm:grid-cols-4">
            {[
              ['Pieces', counts?.pieces, '/browse'],
              ['Makers', counts?.makers, '/history'],
              ['Patents', counts?.patents, '/patents'],
              ['Period ads', counts?.ads, '/advertising'],
            ].map(([label, n, to], i) => (
              <Link key={label} to={to} className={`group block px-3 py-4 text-center ${i ? 'sm:border-l sm:border-ink/25' : ''} ${i % 2 ? 'border-l border-ink/25 sm:border-l' : ''}`}>
                <dd className="font-heading text-[1.9rem] font-bold leading-none text-ink group-hover:text-oxblood">{fmt(n)}</dd>
                <dt className="mt-1.5 font-fell text-[12px] uppercase tracking-[0.2em] text-steel">{label}</dt>
              </Link>
            ))}
          </dl>
        </div>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="mx-auto w-full max-w-[460px] lg:max-w-none">
          {plates.length ? (
            <Plate plate={plates[index]} index={index} total={plates.length} onPrev={() => step(-1)} onNext={() => step(1)} />
          ) : (
            <PlateSkeleton />
          )}
        </div>
      </div>
    </section>
  );
}
