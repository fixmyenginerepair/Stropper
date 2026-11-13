import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { sharpenerImage, typeCountryLine } from '@/lib/archive';

// The popular families the carousel draws from, with the browse link each one opens.
const CATEGORIES = [
  { label: 'German razors', href: '/browse?country=Germany', query: { country: 'Germany' } },
  {
    label: 'Rotary belt sharpeners',
    href: '/browse?type=Rotary%20Belt',
    query: { type: { $regex: '^Rotary Belt', $options: 'i' } },
  },
  {
    label: 'Auto Strop sharpeners',
    href: '/browse?type=Auto%20Strop',
    query: { type: { $regex: '^Auto Strop', $options: 'i' } },
  },
  { label: 'Hones', href: '/browse?type=Hone', query: { type: { $regex: '^Hone', $options: 'i' } } },
];

const PER_CATEGORY = 2;
const AUTO_MS = 6500;

const slideCopy = (sharpener) =>
  sharpener.description ||
  `${sharpener.type || 'Sharpener'}${
    sharpener.country ? ` from ${sharpener.country}` : ''
  } — recorded in the archive and catalogued among the ${
    sharpener.type ? String(sharpener.type).toLowerCase() : 'sharpeners'
  } collectors look for.`;

export default function FeaturedCarousel() {
  const [slides, setSlides] = useState(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      CATEGORIES.map(async (category) => {
        const [count, page] = await Promise.all([
          base44.entities.Sharpener.count(category.query),
          base44.entities.Sharpener.filter(category.query, { sort: 'name', limit: 8 }),
        ]);
        const picks = (page.items || []).filter((item) => item.images?.[0]).slice(0, PER_CATEGORY);
        return picks.map((item) => ({
          ...item,
          categoryLabel: category.label,
          categoryHref: category.href,
          categoryCount: count,
        }));
      })
    )
      .then((groups) => {
        if (!cancelled) setSlides(groups.flat());
      })
      .catch(() => {
        if (!cancelled) setSlides([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (paused || !slides || slides.length < 2) return undefined;
    timer.current = setTimeout(() => setIndex((i) => (i + 1) % slides.length), AUTO_MS);
    return () => clearTimeout(timer.current);
  }, [index, paused, slides]);

  if (!slides || slides.length === 0) return null;

  const slide = slides[index];
  const go = (step) => setIndex((i) => (i + step + slides.length) % slides.length);

  return (
    <section className="archive-container py-12 sm:py-16 lg:py-20">
      <style>{`
        @keyframes featured-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes featured-rise { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        .featured-fade { animation: featured-fade .6s ease-in-out both }
        .featured-rise { animation: featured-rise .5s ease-out both }
        @media (prefers-reduced-motion: reduce) {
          .featured-fade, .featured-rise { animation: none }
        }
      `}</style>

      <div
        className="overflow-hidden rounded-[10px] border border-hair bg-white shadow-[0_18px_50px_-30px_rgba(1,0,104,0.45)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="px-5 pt-6 sm:px-8 sm:pt-8">
          <p className="eyebrow text-oxblood">
            <Link to={slide.categoryHref} className="hover:underline">
              {slide.categoryLabel}
            </Link>
            <span className="text-steel">
              {' '}
              · {slide.categoryCount.toLocaleString()} in the archive
            </span>
          </p>
          <h2
            key={`title-${slide.id}`}
            className="featured-fade mt-2 break-words font-heading text-[1.6rem] font-bold leading-tight text-ink sm:text-[2rem] lg:text-[2.4rem]"
          >
            {slide.name}
          </h2>
        </div>

        <div className="mx-5 mt-5 border-t border-dashed border-hair sm:mx-8" aria-hidden="true" />

        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden bg-frost sm:aspect-[16/10] lg:aspect-auto lg:min-h-[320px]">
            <Image
              key={`image-${slide.id}`}
              src={sharpenerImage(slide)}
              alt={slide.name}
              fittingType="fill"
              className="featured-fade h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 flex gap-2 sm:bottom-6 sm:left-6">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous featured piece"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/20 bg-white/95 text-ink transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-oxblood"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next featured piece"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink/20 bg-white/95 text-ink transition-colors hover:border-oxblood hover:text-oxblood focus-visible:outline focus-visible:outline-2 focus-visible:outline-oxblood"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex min-w-0 flex-col justify-between gap-6 p-5 sm:p-7">
            <div key={`body-${slide.id}`} className="featured-fade">
              <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-steel">
                {typeCountryLine(slide) || 'From the archive'}
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/85">{slideCopy(slide)}</p>
            </div>

            <div>
              <div className="border-t border-dashed border-hair" aria-hidden="true" />
              <div
                key={`cta-${slide.id}`}
                className="featured-rise flex flex-wrap items-center gap-x-6 gap-y-3 pt-4"
              >
                <Link
                  to={`/sharpener/${slide.id}`}
                  className="group inline-flex items-center gap-2 font-mono text-[13px] font-medium text-ink underline decoration-ink/30 underline-offset-4 transition-colors hover:text-oxblood hover:decoration-oxblood"
                >
                  Open this piece
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to={slide.categoryHref}
                  className="text-[13px] text-steel underline decoration-steel/30 underline-offset-4 transition-colors hover:text-oxblood hover:decoration-oxblood"
                >
                  Browse all {slide.categoryLabel.toLowerCase()}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-hair px-5 py-3 sm:px-8">
          <p className="text-[12px] text-steel">
            Featured from the popular families of the collection
          </p>
          <div className="flex items-center gap-1.5">
            {slides.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${item.name}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-oxblood' : 'w-1.5 bg-hair hover:bg-steel'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}