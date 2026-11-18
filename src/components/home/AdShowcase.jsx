import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ThenNow from '@/components/ThenNow';
import { thenAndNow } from '@/lib/inflation';

// Home-page showcase for the Period Advertising collection: a rotating
// "clipping" on aged paper, a filmstrip of every ad, swipe on phones.

const AUTO_MS = 6500;
const yearLabel = (ad) => (ad.year ? `${ad.year_approximate ? 'c. ' : ''}${ad.year}` : 'Undated');

const PAPER = [
  // fine paper grain
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
  'radial-gradient(120% 80% at 50% 0%, rgba(255,255,255,.55), transparent 60%)',
  'radial-gradient(140% 120% at 50% 110%, rgba(120,72,20,.16), transparent 60%)',
  'linear-gradient(#f3ead6, #eadcbf)',
].join(',');

const CSS = `
@keyframes ad-in { from { opacity: 0; transform: translateY(14px) rotate(var(--tilt)) scale(.97) } to { opacity: 1; transform: translateY(0) rotate(var(--tilt)) scale(1) } }
@keyframes ad-kb { from { transform: scale(1) } to { transform: scale(1.06) } }
@keyframes ad-text { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes ad-year { from { opacity: 0; letter-spacing: .12em } to { opacity: 1; letter-spacing: -.02em } }
@keyframes ad-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
.ad-clip { animation: ad-in .7s cubic-bezier(.2,.8,.2,1) both }
.ad-kb { animation: ad-kb ${AUTO_MS + 1500}ms ease-out both }
.ad-text { animation: ad-text .6s ease-out both }
.ad-year { animation: ad-year .8s ease-out both }
.ad-progress { animation: ad-progress ${AUTO_MS}ms linear both; transform-origin: left }
.ad-paused .ad-progress, .ad-paused .ad-kb { animation-play-state: paused }
@media (prefers-reduced-motion: reduce) {
  .ad-clip, .ad-kb, .ad-text, .ad-year, .ad-progress { animation: none }
}
`;

export default function AdShowcase() {
  const [ads, setAds] = useState(null);
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false); // hover / focus / touch
  const [stopped, setStopped] = useState(false); // user pressed pause
  const timer = useRef(null);
  const swipe = useRef(null);
  const strip = useRef(null);

  useEffect(() => {
    let cancelled = false;
    base44.entities.PeriodAd.list('year', 200)
      .then((rows) => {
        if (cancelled) return;
        const list = (Array.isArray(rows) ? rows : rows?.items || []).filter((a) => a.image);
        setAds(list);
        // Start somewhere different on each visit.
        setIndex(list.length ? Math.floor(Math.random() * list.length) : 0);
      })
      .catch(() => !cancelled && setAds([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const paused = hold || stopped;

  useEffect(() => {
    if (paused || !ads || ads.length < 2) return undefined;
    timer.current = setTimeout(() => setIndex((i) => (i + 1) % ads.length), AUTO_MS);
    return () => clearTimeout(timer.current);
  }, [index, paused, ads]);

  // Keep the active thumbnail in view without scrolling the page.
  useEffect(() => {
    const row = strip.current;
    const el = row?.children[index];
    if (!row || !el) return;
    const target = el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2;
    row.scrollTo({ left: target, behavior: 'smooth' });
  }, [index]);

  const stats = useMemo(() => {
    if (!ads?.length) return null;
    const years = ads.map((a) => a.year).filter(Boolean);
    const brands = new Set(ads.map((a) => (a.brand || '').split(' (')[0]).filter(Boolean));
    const countries = new Set(ads.map((a) => a.country).filter(Boolean));
    return {
      count: ads.length,
      span: years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '',
      brands: brands.size,
      countries: countries.size,
    };
  }, [ads]);

  if (!ads || ads.length === 0) return null;

  const ad = ads[index];
  const go = (step) => setIndex((i) => (i + step + ads.length) % ads.length);
  const tilt = index % 2 ? '1.4deg' : '-1.6deg';

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    swipe.current = { x: e.clientX, y: e.clientY };
    setHold(true);
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    setHold(false);
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
  };

  return (
    <section
      className={`relative overflow-hidden border-y-4 border-double border-ink/25 ${paused ? 'ad-paused' : ''}`}
      style={{ backgroundImage: PAPER }}
      aria-roledescription="carousel"
      aria-label="Period advertising"
    >
      <style>{CSS}</style>

      {/* Big faint year behind everything */}
      <span
        key={`bg-${ad.id}`}
        aria-hidden="true"
        className="ad-year pointer-events-none absolute -right-6 top-6 select-none font-heading text-[9rem] font-extrabold leading-none text-[#7a4a14]/[0.07] sm:text-[14rem] lg:-right-4 lg:top-2 lg:text-[19rem]"
      >
        {ad.year || ''}
      </span>

      <div className="archive-container relative py-12 sm:py-16 lg:py-20">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow text-oxblood">From the archive · Period advertising</p>
            <h2 className="mt-3 font-heading text-[2rem] font-bold leading-[1.1] text-ink sm:text-[2.6rem]">
              How they sold a sharper edge
            </h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink/75">
              Magazine pages and trade ads from the years when a good blade was worth keeping:
              stropped, honed and passed down.
            </p>
          </div>
          {stats && (
            <dl className="flex flex-wrap gap-2">
              {[
                [stats.count, 'ads'],
                [stats.span, 'years'],
                [stats.brands, 'brands'],
                [stats.countries, 'countries'],
              ]
                .filter(([v]) => v)
                .map(([v, k]) => (
                  <div
                    key={k}
                    className="rounded-full border border-ink/15 bg-white/60 px-3.5 py-1.5 text-[13px] text-ink shadow-sm backdrop-blur"
                  >
                    <dt className="sr-only">{k}</dt>
                    <dd>
                      <span className="font-heading font-bold">{v}</span>{' '}
                      <span className="text-steel">{k}</span>
                    </dd>
                  </div>
                ))}
            </dl>
          )}
        </header>

        <div
          className="mt-10 grid items-center gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={() => setHold(false)}
        >
          {/* The clipping */}
          <div className="relative mx-auto w-full max-w-[460px]">
            <div
              key={`clip-${ad.id}`}
              className="ad-clip relative"
              style={{ '--tilt': tilt, transform: `rotate(${tilt})` }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                swipe.current = null;
                setHold(false);
              }}
            >
              {/* tape */}
              <span
                aria-hidden="true"
                className="absolute -top-3 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rotate-[-3deg] bg-[#f6efd9]/80 shadow-sm"
                style={{ clipPath: 'polygon(3% 0, 97% 4%, 100% 100%, 0 96%)' }}
              />
              <div
                className="overflow-hidden bg-[#fbf7ec] p-3 sm:p-4"
                style={{ boxShadow: '0 30px 60px -25px rgba(60,35,5,.55), 0 2px 6px rgba(60,35,5,.18)' }}
              >
                <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-[#f1e9d6]">
                  <img
                    src={ad.image}
                    alt={`${ad.title} — ${ad.brand || ''} advertisement, ${yearLabel(ad)}`}
                    className="ad-kb h-full w-full object-contain"
                    draggable={false}
                    style={{ touchAction: 'pan-y' }}
                  />
                </div>
                <p className="mt-2 text-center text-[11px] uppercase tracking-[0.18em] text-steel">
                  {ad.publication?.replace(/\s*\(.*\)$/, '') || 'Period advertisement'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous ad"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/80 text-ink shadow-sm transition-colors hover:border-oxblood hover:text-oxblood"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setStopped((s) => !s)}
                aria-label={stopped ? 'Play slideshow' : 'Pause slideshow'}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/80 text-ink shadow-sm transition-colors hover:border-oxblood hover:text-oxblood"
              >
                {stopped ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next ad"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-white/80 text-ink shadow-sm transition-colors hover:border-oxblood hover:text-oxblood"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-center text-[12px] text-steel">Tap the ad to zoom in</p>
          </div>

          {/* The story */}
          <div className="min-w-0" aria-live="polite">
            <div key={`text-${ad.id}`}>
              <div className="flex items-baseline gap-4">
                <span className="ad-year font-heading text-[3.4rem] font-extrabold leading-none text-oxblood sm:text-[4.5rem]">
                  {yearLabel(ad)}
                </span>
                <span className="h-px flex-1 bg-ink/20" aria-hidden="true" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-steel">
                  {index + 1} / {ads.length}
                </span>
              </div>
              <p className="ad-text mt-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/60">
                {ad.brand}
                {ad.country ? ` · ${ad.country}` : ''}
                {ad.audience === 'Trade (dealers)' ? ' · Trade ad' : ''}
              </p>
              <h3
                className="ad-text mt-2 break-words font-heading text-[1.7rem] font-bold leading-tight text-ink sm:text-[2.1rem]"
                style={{ animationDelay: '60ms' }}
              >
                “{ad.title}”
              </h3>
              {ad.summary && (
                <p
                  className="ad-text mt-4 text-[16px] leading-relaxed text-ink/80"
                  style={{ animationDelay: '120ms' }}
                >
                  {ad.summary}
                </p>
              )}
              {thenAndNow(ad) ? (
                <div className="ad-text mt-5 max-w-md" style={{ animationDelay: '180ms' }}>
                  <ThenNow ad={ad} />
                </div>
              ) : ad.prices_quoted && (
                <div
                  className="ad-text mt-5 inline-flex max-w-full items-start gap-3 rounded-lg border border-dashed border-oxblood/40 bg-white/55 px-4 py-2.5"
                  style={{ animationDelay: '180ms' }}
                >
                  <span className="shrink-0 pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-oxblood">
                    Then
                  </span>
                  <span className="min-w-0 break-words text-[14px] text-ink">{ad.prices_quoted}</span>
                </div>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                to={`/advertising?ad=${ad.id}`}
                className="group inline-flex items-center gap-2 rounded-lg bg-oxblood px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-oxblood-dark"
              >
                Read this ad
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/advertising"
                className="text-[14px] font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:text-oxblood hover:decoration-oxblood"
              >
                See all {ads.length} ads
              </Link>
            </div>

            {/* progress */}
            <div className="mt-8 h-[3px] w-full overflow-hidden rounded-full bg-ink/10" aria-hidden="true">
              <div key={`p-${ad.id}-${paused}`} className="ad-progress h-full w-full bg-oxblood" />
            </div>
          </div>
        </div>

        {/* Filmstrip */}
        <div
          ref={strip}
          className="mt-10 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {ads.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${item.title} (${yearLabel(item)})`}
              aria-current={i === index}
              data-no-zoom
              className={`group relative w-[76px] shrink-0 overflow-hidden rounded-md border-2 bg-[#fbf7ec] transition-all sm:w-[92px] ${
                i === index
                  ? 'border-oxblood shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ scrollSnapAlign: 'center' }}
            >
              <img
                src={item.image}
                alt=""
                loading="lazy"
                className="aspect-[3/4] w-full object-cover object-top"
              />
              <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-0.5 text-center text-[10px] font-semibold text-white">
                {yearLabel(item)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
