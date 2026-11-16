import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MECHANISMS } from '@/lib/mechanisms';
import { MechanismDiagram, MechanismSteps } from '@/components/HowItWorks';

const TYPE_LABELS = {
  'Rollers-1': 'One roller',
  'Rollers-2': 'Two rollers',
  'Rollers-3': 'Three rollers',
  'Rollers-4': 'Four rollers',
  'Hone-Carborundum': 'Carborundum hones',
  'Hone-Glass/Other': 'Glass and other hones',
  'Handle-like Valet': 'Valet-style',
  'Handle-like Ingersoll': 'Ingersoll-style holders',
  'Blade Holder & Hone': 'Holders with a stone',
};

export default function HowItWorks() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, [hash]);

  return (
    <div className="archive-container py-10 lg:py-14">
      <p className="eyebrow text-oxblood">How it works</p>
      <h1 className="mt-3 max-w-3xl font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.6rem]">
        How a razor sharpener works
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-steel">
        Safety-razor blades went dull after a few shaves, so for half a century inventors raced to bring them back to life.
        Nearly every piece in this archive works in one of these eight ways. The blade's working edge is shown in red.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Jump to a mechanism">
        {MECHANISMS.map((m) => (
          <a
            key={m.key}
            href={`#${m.key}`}
            className="rounded-full border border-hair bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-oxblood hover:text-oxblood"
          >
            {m.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        {MECHANISMS.map((m, i) => (
          <section
            key={m.key}
            id={m.key}
            className="scroll-mt-24 grid gap-8 border-t border-hair pt-10 lg:grid-cols-2 lg:items-center lg:gap-12"
          >
            <MechanismDiagram mechanism={m} className={i % 2 ? 'lg:order-2' : ''} />
            <div className="min-w-0">
              <p className="eyebrow text-steel">{String(i + 1).padStart(2, '0')}</p>
              <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-[1.8rem]">{m.title}</h2>
              <p className="mt-2 text-[15px] text-steel">{m.short}</p>
              <MechanismSteps mechanism={m} />
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-steel">See them:</span>
                {m.types.map((t) => (
                  <Link
                    key={t}
                    to={`/browse?type=${encodeURIComponent(t)}`}
                    className="rounded-full border border-oxblood/30 bg-white px-3 py-1 text-[13px] text-oxblood hover:border-oxblood"
                  >
                    {TYPE_LABELS[t] || t}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-16 max-w-2xl border-t border-hair pt-6 text-[14px] leading-relaxed text-steel">
        A few rarer families, such as marble and ball-bearing edgers, magnetic sharpeners, shake-sharps and electric models,
        will be added here as their workings are documented.
      </p>
    </div>
  );
}
