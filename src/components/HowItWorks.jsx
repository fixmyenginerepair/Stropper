import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { HOW_IT_WORKS_CSS } from '@/lib/mechanisms';

let cssInjected = false;
function useHowItWorksCss() {
  useEffect(() => {
    if (cssInjected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.setAttribute('data-how-it-works', '');
    style.textContent = HOW_IT_WORKS_CSS;
    document.head.appendChild(style);
    cssInjected = true;
  }, []);
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// One animated mechanism diagram with a play/pause control.
export function MechanismDiagram({ mechanism, className = '' }) {
  useHowItWorksCss();
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());

  return (
    <div className={`relative overflow-hidden rounded-[12px] bg-navy p-3 sm:p-5 ${className}`} data-no-zoom>
      <div
        className={playing ? '' : 'hw-paused'}
        role="img"
        aria-label={`Animated diagram: ${mechanism.title}. ${mechanism.short}`}
        dangerouslySetInnerHTML={{ __html: mechanism.svg }}
      />
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:bottom-3 sm:right-3"
        aria-label={playing ? 'Pause animation' : 'Play animation'}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function MechanismSteps({ mechanism }) {
  return (
    <ol className="mt-4 space-y-3">
      {mechanism.steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink/85">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-oxblood text-[12px] font-bold text-white">
            {i + 1}
          </span>
          <span className="min-w-0">{step}</span>
        </li>
      ))}
    </ol>
  );
}

// Section for a sharpener's own page.
export default function HowItWorksSection({ mechanism }) {
  if (!mechanism) return null;
  return (
    <section className="mt-14 border-t border-hair pt-10">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-12">
        <MechanismDiagram mechanism={mechanism} />
        <div className="min-w-0">
          <p className="eyebrow text-oxblood">How it works</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-[1.7rem]">{mechanism.title}</h2>
          <p className="mt-2 text-[15px] text-steel">{mechanism.short}</p>
          <MechanismSteps mechanism={mechanism} />
          <Link
            to={`/how-it-works#${mechanism.key}`}
            className="mt-5 inline-block text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
          >
            See how every type of sharpener works
          </Link>
        </div>
      </div>
    </section>
  );
}
