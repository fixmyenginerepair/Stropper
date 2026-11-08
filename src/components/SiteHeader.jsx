import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { NAV_LINKS, SITE } from '@/lib/site';

const signIn = () => base44.auth.redirectToLogin(window.location.href);

// Polished straight-razor blade used as the banner's bottom edge.
// Spine on top, honed edge underneath, shoulder at left, round toe at right.
const STEEL_STOPS = [
  ['0%', '#2f3746'],
  ['18%', '#59647a'],
  ['30%', '#eef2f7'],
  ['55%', '#c3ccd8'],
  ['74%', '#8a96a9'],
  ['86%', '#5d697d'],
  ['93%', '#b9c3d1'],
  ['100%', '#ffffff'],
];
const steelCss = `linear-gradient(to bottom, ${STEEL_STOPS.map(([o, c]) => `${c} ${o}`).join(', ')})`;

function SteelGradient({ id }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="14" gradientUnits="userSpaceOnUse">
      {STEEL_STOPS.map(([o, c]) => (
        <stop key={o} offset={o} stopColor={c} />
      ))}
    </linearGradient>
  );
}

function RazorBlade() {
  return (
    <div aria-hidden="true" className="razor-blade pointer-events-none flex h-[14px] w-full">
      <style>{`
        .razor-blade{filter:drop-shadow(0 3px 3px rgba(0,0,30,.45))}
        .razor-glint{animation:razor-glint 7s ease-in-out infinite}
        @keyframes razor-glint{0%,55%{transform:translateX(-30vw) skewX(-25deg)}100%{transform:translateX(130vw) skewX(-25deg)}}
        @media (prefers-reduced-motion: reduce){.razor-glint{animation:none;display:none}}
      `}</style>
      {/* Shoulder / tang */}
      <svg width="46" height="14" viewBox="0 0 46 14" className="shrink-0">
        <defs><SteelGradient id="razor-steel-l" /></defs>
        <path d="M0 0 H46 V14 H20 Q12 14 9 9 Q7 6 0 6 Z" fill="url(#razor-steel-l)" />
        <path d="M0 0 H18 V6 H0 Z" fill="#4a5466" />
        <path d="M3 2 H15" stroke="#8a96a9" strokeWidth="1" strokeDasharray="1.5 1.5" />
      </svg>
      {/* Blade body */}
      <div className="relative -mx-px flex-1 overflow-hidden" style={{ background: steelCss }}>
        <span
          className="razor-glint absolute inset-y-0 left-0 w-24"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)' }}
        />
      </div>
      {/* Round toe */}
      <svg width="26" height="14" viewBox="0 0 26 14" className="shrink-0">
        <defs><SteelGradient id="razor-steel-r" /></defs>
        <path d="M0 0 H12 Q25 1 25 7 Q24 12 16 14 H0 Z" fill="url(#razor-steel-r)" />
      </svg>
    </div>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy">
      <div className="archive-container">
        <div className="flex h-[76px] items-center justify-between sm:h-[88px]">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Stropper.com home">
            <img src={SITE.logo} alt="Stropper.com" className="h-12 w-auto sm:h-[60px]" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive ? 'text-white' : 'text-white/75 hover:text-white'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={signIn}
              className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
            >
              Collector sign in
            </button>
          </nav>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-white lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-navy lg:hidden">
          <div className="archive-container flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="border-b border-white/10 py-3 text-sm text-white/80 last:border-0"
              >
                {link.label}
              </NavLink>
            ))}
            <button
              onClick={signIn}
              className="my-4 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy"
            >
              Collector sign in
            </button>
          </div>
        </nav>
      )}

      <RazorBlade />
    </header>
  );
}