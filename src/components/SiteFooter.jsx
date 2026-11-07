import { SITE } from '@/lib/site';

export default function SiteFooter() {
  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="archive-container py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <img src={SITE.logo} alt="Stropper.com" className="h-12 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              © Stropper.com — archiving razor sharpeners for over 30 years
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm md:flex-row md:gap-10">
            <a
              href={`mailto:${SITE.webmaster}`}
              className="text-white/75 transition-colors hover:text-white"
            >
              Contact the webmaster
            </a>
            <a href="/about" className="text-white/75 transition-colors hover:text-white">
              Help
            </a>
            <a
              href={SITE.sister}
              target="_blank"
              rel="noreferrer"
              className="text-white/75 transition-colors hover:text-white"
            >
              ShaveWorld.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}