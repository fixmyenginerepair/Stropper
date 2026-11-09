import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const HERO_IMAGE =
  'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/405754d86_stropper-hero.jpg';

const CHIPS = [
  { label: 'Rollers', to: '/browse?type=Rollers' },
  { label: 'Auto Strop', to: '/browse?type=Auto+Strop' },
  { label: 'Pull String', to: '/browse?type=Pull+String' },
  { label: 'Germany', to: '/browse?country=Germany' },
];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    navigate(query.trim() ? `/browse?q=${encodeURIComponent(query.trim())}` : '/browse');
  };

  return (
    <section className="bg-navy text-white">
      <div className="archive-container grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-24">
        <div>
          <p className="eyebrow text-white/55">The world of razor sharpeners</p>
          <h1 className="mt-4 max-w-2xl break-words font-heading text-[1.95rem] font-bold leading-[1.1] sm:mt-5 sm:text-5xl lg:text-[3.4rem]">
            The most complete archive of razor sharpeners on the web.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70">
            Strops, hones, rollers and stroppers from makers around the world — catalogued,
            photographed and rated by collectors for collectors.
          </p>

          <form onSubmit={submit} className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search maker, model, patent number…"
                aria-label="Search the archive"
                className="h-14 w-full rounded-lg border border-transparent bg-white pl-12 pr-4 text-[15px] text-ink placeholder:text-steel/80 focus:outline-none focus:ring-2 focus:ring-oxblood"
              />
            </div>
            <button
              type="submit"
              className="h-14 rounded-lg bg-white px-7 text-[15px] font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Search the archive
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[13px] text-white/45">Try</span>
            {CHIPS.map((chip) => (
              <a
                key={chip.label}
                href={chip.to}
                className="rounded-full border border-white/20 px-4 py-2 text-[13px] text-white/80 transition-colors hover:border-white/60 hover:text-white"
              >
                {chip.label}
              </a>
            ))}
          </div>
        </div>

        <div className="relative h-[260px] sm:h-[420px] lg:h-[480px]">
          <img
            src={HERO_IMAGE}
            alt="A straight razor resting on an oxblood leather strop"
            className="absolute inset-0 h-full w-full object-cover object-right"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>
  );
}