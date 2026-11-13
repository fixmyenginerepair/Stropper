import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, UserRound, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { NAV_GROUPS, SITE } from '@/lib/site';
import { cached } from '@/lib/limited';

const signIn = () => {
  const back = window.location.pathname + window.location.search;
  window.location.href = `/login?returnTo=${encodeURIComponent(back)}`;
};

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
    <div aria-hidden="true" className="razor-blade pointer-events-none flex h-[18px] w-full bg-navy">
      <style>{`
        .razor-blade{box-shadow:0 4px 6px -2px rgba(0,0,30,.5)}
        .razor-glint{animation:razor-glint 7s ease-in-out infinite}
        @keyframes razor-glint{0%,55%{transform:translateX(-30vw) skewX(-25deg)}100%{transform:translateX(130vw) skewX(-25deg)}}
        @media (prefers-reduced-motion: reduce){.razor-glint{animation:none;display:none}}
      `}</style>
      {/* Shoulder / tang */}
      <svg width="59" height="18" viewBox="0 0 46 14" className="shrink-0">
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
      <svg width="33" height="18" viewBox="0 0 26 14" className="shrink-0">
        <defs><SteelGradient id="razor-steel-r" /></defs>
        <path d="M0 0 H12 Q25 1 25 7 Q24 12 16 14 H0 Z" fill="url(#razor-steel-r)" />
      </svg>
    </div>
  );
}

const isActivePath = (pathname, to) => pathname === to || pathname.startsWith(`${to}/`);

// Dropdown that opens on hover (desktop pointer) or click, closes on Escape / outside click.
function Dropdown({ label, active, align = 'left', children, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const hovering = useRef(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const enter = () => { hovering.current = true; clearTimeout(timer.current); setOpen(true); };
  const leave = () => { hovering.current = false; timer.current = setTimeout(() => setOpen(false), 150); };
  // With a mouse the menu is already open on hover, so a click keeps it open; keyboard/touch toggles.
  const toggle = () => setOpen((v) => (hovering.current ? true : !v));

  return (
    <div ref={ref} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors ${
          active || open ? 'text-white' : 'text-white/75 hover:text-white'
        }`}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        {active && <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded bg-[#c0392b]" />}
      </button>
      {open && (
        <div className={`absolute top-full z-50 pt-3 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="w-72 overflow-hidden rounded-[10px] border border-hair bg-white py-2 shadow-[0_18px_40px_-12px_rgba(1,0,104,0.45)]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ to, label, note, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block border-l-2 px-4 py-2.5 transition-colors ${
          isActive ? 'border-oxblood bg-frost' : 'border-transparent hover:border-oxblood/40 hover:bg-frost/70'
        }`
      }
    >
      <span className="block text-[14px] font-semibold text-ink">{label}</span>
      {note && <span className="block text-[12.5px] text-steel">{note}</span>}
    </NavLink>
  );
}

function AccountMenu({ me }) {
  if (!me) {
    return (
      <button
        onClick={signIn}
        className="ml-2 whitespace-nowrap rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-white/90"
      >
        Collector sign in
      </button>
    );
  }
  const name = (me.full_name || me.email || 'Account').split(' ')[0];
  return (
    <div className="ml-2">
      <Dropdown label={name} icon={UserRound} align="right">
        <MenuItem to="/dashboard" label="My dashboard" note="Your profile and pieces" />
        {me.role === 'admin' && <MenuItem to="/admin" label="Backend" note="Edit the archive" />}
        <div className="my-1 border-t border-hair" />
        <button onClick={() => base44.auth.logout('/')} className="block w-full px-4 py-2.5 text-left text-[14px] font-semibold text-oxblood hover:bg-frost/70">
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    cached('me', () => base44.auth.me()).then(setMe).catch(() => setMe(null));
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy">
      <div className="archive-container">
        <div className="flex h-[76px] items-center justify-between sm:h-[88px]">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Stropper.com home">
            <img
              src={SITE.logo}
              alt="Stropper.com"
              className="h-12 w-auto object-contain sm:h-[60px] lg:max-w-[170px] xl:max-w-none"
            />
          </Link>

          <nav className="hidden items-center gap-x-1 lg:flex xl:gap-x-3" aria-label="Main">
            {NAV_GROUPS.map((group) =>
              group.children ? (
                <Dropdown
                  key={group.label}
                  label={group.label}
                  active={group.children.some((c) => isActivePath(pathname, c.to))}
                >
                  {group.children.map((c) => <MenuItem key={c.to} {...c} />)}
                </Dropdown>
              ) : (
                <NavLink
                  key={group.to}
                  to={group.to}
                  className={({ isActive }) =>
                    `relative whitespace-nowrap rounded-md px-2 py-1.5 text-sm transition-colors ${
                      isActive ? 'text-white' : 'text-white/75 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {group.label}
                      {isActive && <span className="absolute inset-x-2 -bottom-1 h-0.5 rounded bg-[#c0392b]" />}
                    </>
                  )}
                </NavLink>
              )
            )}
            <AccountMenu me={me} />
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
          <div className="archive-container max-h-[calc(100vh-110px)] overflow-y-auto py-4">
            <div className="grid gap-6 sm:grid-cols-2">
              {NAV_GROUPS.filter((g) => g.children).map((group) => (
                <div key={group.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{group.label}</p>
                  <div className="mt-1">
                    {group.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        onClick={close}
                        className={({ isActive }) => `block border-b border-white/10 py-2.5 text-[15px] ${isActive ? 'text-white' : 'text-white/80'}`}
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-6 border-t border-white/10 pt-3">
              {NAV_GROUPS.filter((g) => !g.children).map((g) => (
                <NavLink key={g.to} to={g.to} onClick={close} className={({ isActive }) => `py-1.5 text-[15px] ${isActive ? 'text-white' : 'text-white/80'}`}>
                  {g.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4">
              {me ? (
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link to="/dashboard" onClick={close} className="text-[15px] text-white/80">My dashboard</Link>
                  {me.role === 'admin' && <Link to="/admin" onClick={close} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy">Backend</Link>}
                  <button onClick={() => base44.auth.logout('/')} className="text-[15px] text-white/80">Sign out</button>
                </div>
              ) : (
                <button onClick={signIn} className="w-full rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy">Collector sign in</button>
              )}
            </div>
          </div>
        </nav>
      )}

      <RazorBlade />
    </header>
  );
}