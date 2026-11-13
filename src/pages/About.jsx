import { Link } from 'react-router-dom';
import { SITE } from '@/lib/site';

// --- About the Founder -------------------------------------------------------
// Paste asset URLs here after uploading in Base44 > Assets (leave '' to hide).
const FOUNDER_PHOTO =
  'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/f6b313c24_tom-willard-cincinnati-full.jpg';
const PRESENTATION_PDF =
  'https://media.base44.com/files/public/6aef7ea3490a3928d32a4982/ed40313be_1216275358.pdf';

const PRESENTATION = {
  title: 'The World of Razor Sharpeners',
  page: 'https://www.slideserve.com/judson/the-world-of-razor-sharpeners-by-tom-willard',
  embed: 'https://www.slideserve.com/embed/282385',
};

const FOUNDER_FACTS = [
  ['Name', 'Thomas V. “Tom” Willard'],
  ['Service', 'Colonel, U.S. Air Force (Ret.)'],
  ['Collection', '1,500+ razor sharpeners & stroppers'],
  ['Founded', 'Stropper.com & ShaveWorld.org'],
];

const FOUNDER_LINKS = [
  { label: 'The World of Razor Sharpeners — presentation (SlideServe)', href: PRESENTATION.page },
  { label: 'Presentation embed (SlideServe)', href: PRESENTATION.embed },
  { label: 'Original Stropper.com', href: 'http://www.stropper.com/' },
  { label: 'ShaveWorld.org — International Organization for Shaving Memorabilia', href: 'http://www.shaveworld.org/' },
];

// Modern illustrations in a vintage style — decorative only, not period ads.
const ILLUSTRATIONS = [
  {
    src: 'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/0861f2705_illustration-blade-sharpener.jpg',
    alt: 'Vintage-style illustration of a man using a safety razor blade sharpener',
  },
  {
    src: 'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/771f1fbfc_illustration-razor-strop.jpg',
    alt: 'Vintage-style illustration of a man stropping a straight razor on a hanging leather strop',
  },
];

const linkCls =
  'font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood';

function AboutFounder() {
  return (
    <section id="founder" className="border-b border-hair bg-white">
      <div className="archive-container py-12 sm:py-16">
        <p className="eyebrow text-steel">About the founder</p>
        <h2 className="mt-3 font-heading text-[1.8rem] font-bold leading-tight text-ink sm:text-4xl">
          Col. Thomas V. “Tom” Willard, USAF (Ret.)
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-5 text-[16px] leading-relaxed text-ink/85">
            <p>
              Tom Willard, a retired Colonel of the United States Air Force, has assembled one of the
              largest collections of razor strops and sharpeners in the world. In his own survey of
              the field’s leading stropper collections, his collection of more than 1,500 pieces
              heads the list — ahead of collectors in Germany, France, the Netherlands and Scandinavia.
            </p>
            <p>
              About thirty years ago he built Stropper.com to catalogue every sharpener he could
              find, and went on to develop its sister site, ShaveWorld.org — The International
              Organization for Shaving Memorabilia. He wrote every line of both sites himself — the
              PHP, HTML, CSS, Java and SQL — over several years, creating what became the most
              comprehensive listing of razor sharpeners on the web.
            </p>
            <p>
              His presentation, <em>The World of Razor Sharpeners</em>, maps the whole subject:
              roughly 2,000 known sharpeners and stroppers (not counting leather strops and
              straight-razor hones), built from leather, glass, steel and bakelite to magnetic
              fields, with the earliest patents he found dating to 1839 (a strop with a handle),
              1877 (cylindrical rollers) and 1902 (magnetism).
            </p>
            <p>
              Tom is now passing the torch to his son, John W. Willard, who is rebuilding the
              archive to protect the collection, carry it forward, and honor the passion behind it.
            </p>

            <dl className="grid gap-px overflow-hidden rounded-[10px] border border-hair bg-hair sm:grid-cols-2">
              {FOUNDER_FACTS.map(([k, v]) => (
                <div key={k} className="bg-white px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">{k}</dt>
                  <dd className="mt-1 text-[15px] font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="self-start">
            {FOUNDER_PHOTO ? (
              <img
                src={FOUNDER_PHOTO}
                alt="Tom Willard beside his table of antique razor sharpeners at a shaving collectibles meeting"
                className="w-full rounded-[10px] border border-hair object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[10px] border border-dashed border-hair bg-navy/5 text-sm text-steel">
                Founder photo coming soon
              </div>
            )}
            <figcaption className="mt-3 text-[13px] leading-relaxed text-steel">
              Tom Willard with his display of sharpeners and stroppers at a shaving collectibles meeting.
            </figcaption>
          </figure>
        </div>

        <div className="mt-12">
          <h3 className="font-heading text-2xl font-bold text-ink">{PRESENTATION.title}</h3>
          <p className="mt-2 text-[15px] text-steel">A presentation by Tom Willard — 33 slides.</p>
          <div className="mt-5 w-full max-w-3xl overflow-hidden rounded-[10px] border border-hair bg-white">
            <div className="relative w-full" style={{ paddingBottom: '82.8%' }}>
              <iframe
                src={PRESENTATION.embed}
                title={`${PRESENTATION.title} by Tom Willard`}
                className="absolute inset-0 h-full w-full"
                frameBorder="0"
                scrolling="no"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          <div className="mt-6 rounded-[10px] border border-hair bg-white p-5 sm:p-6">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">Direct links</h4>
            <ul className="mt-3 space-y-2.5 text-[15px]">
              {PRESENTATION_PDF && (
                <li>
                  <a href={PRESENTATION_PDF} target="_blank" rel="noreferrer" className={linkCls}>
                    Download the presentation (PDF)
                  </a>
                </li>
              )}
              {FOUNDER_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noreferrer" className={linkCls}>
                    {l.label}
                  </a>
                  <span className="mt-0.5 block break-all text-[12px] text-steel">{l.href}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div>
      <section className="bg-navy py-12 text-white sm:py-16">
        <div className="archive-container max-w-3xl">
          <p className="eyebrow text-white/55">About the archive</p>
          <h1 className="mt-3 font-heading text-[1.9rem] font-bold leading-tight sm:mt-4 sm:text-4xl">
            Archiving razor sharpeners for over 30 years
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-white/70">
            Stropper.com began as a card index kept by a handful of collectors trading notes on
            strops, rollers and stroppers. It has grown into the most complete record of these
            devices anywhere on the web.
          </p>
        </div>
      </section>

      <AboutFounder />

      <section className="archive-container grid gap-8 py-12 sm:gap-10 sm:py-16 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6 text-[16px] leading-relaxed text-ink/85">
          <h2 className="font-heading text-2xl font-bold text-ink">What is catalogued</h2>
          <p>
            Each entry records the maker and address, the country of manufacture, patent details,
            the blade it was built to serve, and the collection it belongs to. Rarity is graded
            from 1 (common) to 9 (unique), with T for trade or one-off pieces, and an estimated
            value is kept in US dollars.
          </p>
          <p>
            Photographs come from collectors themselves. Where no photograph exists, a
            representative image of the type is shown so the entry still reads correctly.
          </p>

          <h2 className="font-heading text-2xl font-bold text-ink">Who can add entries</h2>
          <p>
            The archive is read by anyone. Entries are added and edited by the archive’s
            administrators, who work from collector submissions — so if you own a sharpener that
            isn’t here yet, write to the webmaster with photographs and what you know about it.
          </p>

          <h2 className="font-heading text-2xl font-bold text-ink">The Book</h2>
          <p>
            Any search can be turned into a printed book: the entire archive, one type, one
            country, or a single collector’s pieces. Use{' '}
            <Link to="/book" className="font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">
              The Book
            </Link>{' '}
            to build and print it.
          </p>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[10px] border border-hair bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-ink">Get in touch</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-steel">
              Corrections, photographs and additions are always welcome.
            </p>
            <a
              href={`mailto:${SITE.webmaster}`}
              className="mt-4 inline-block text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
            >
              Contact the webmaster
            </a>
          </div>

          <div className="rounded-[10px] border border-hair bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-ink">Sister site</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-steel">
              Razors, blades and the history behind them.
            </p>
            <a
              href={SITE.sister}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
            >
              ShaveWorld.org
            </a>
          </div>

          <figure>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              {ILLUSTRATIONS.map((img) => (
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="w-full rounded-[10px] border border-hair"
                />
              ))}
            </div>
            <figcaption className="mt-2 text-[12px] leading-relaxed text-steel">
              Modern illustrations in a vintage style, not original period ads. For real ads from
              the era, see{' '}
              <Link to="/advertising" className={linkCls}>
                Period advertising
              </Link>
              .
            </figcaption>
          </figure>
        </aside>
      </section>
    </div>
  );
}