import { Link } from 'react-router-dom';
import { SITE } from '@/lib/site';

const LINKS = [
  { label: 'Browse the archive', to: '/browse' },
  { label: 'Through the decades', to: '/#decades' },
  { label: 'Makers & stories', to: '/history' },
  { label: 'Patents', to: '/patents' },
  { label: 'Period advertising', to: '/advertising' },
  { label: 'Classic Stropper', to: '/classic' },
  { label: 'Help', to: '/about' },
];

export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="h-1.5 bg-oxblood" />
      <div className="archive-container py-14">
        <div className="ornament-rule text-white/35">
          <span className="font-fell text-2xl leading-none text-white/70">❦</span>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <img src={SITE.logo} alt="Stropper.com" className="h-12 w-auto" />
            <p className="mt-5 max-w-sm font-heading text-[19px] italic leading-snug text-white/85">
              A catalogue of the ingenious little machines that kept a razor keen.
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
              © Stropper.com — archiving razor sharpeners for over 30 years.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[15px]">
            {LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="text-white/75 transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
            <a href={`mailto:${SITE.webmaster}`} className="text-white/75 transition-colors hover:text-white">
              Contact the webmaster
            </a>
            <a href={SITE.sister} target="_blank" rel="noreferrer" className="text-white/75 transition-colors hover:text-white">
              ShaveWorld.org ↗
            </a>
          </div>
        </div>
        <p className="mt-12 text-center font-fell text-[13px] uppercase tracking-[0.3em] text-white/40">
          Strops · Hones · Rollers · Stroppers
        </p>
      </div>
    </footer>
  );
}
