import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { NAV_LINKS, SITE } from '@/lib/site';

const signIn = () => base44.auth.redirectToLogin(window.location.href);

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-[5px] border-oxblood bg-navy">
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
    </header>
  );
}