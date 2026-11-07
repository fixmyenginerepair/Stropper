import { Link } from 'react-router-dom';
import { SITE } from '@/lib/site';

export default function About() {
  return (
    <div>
      <section className="bg-navy py-16 text-white">
        <div className="archive-container max-w-3xl">
          <p className="eyebrow text-white/55">About the archive</p>
          <h1 className="mt-4 font-heading text-4xl font-bold leading-tight">
            Archiving razor sharpeners for over 30 years
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-white/70">
            Stropper.com began as a card index kept by a handful of collectors trading notes on
            strops, rollers and stroppers. It has grown into the most complete record of these
            devices anywhere on the web.
          </p>
        </div>
      </section>

      <section className="archive-container grid gap-10 py-16 lg:grid-cols-[1.3fr_0.7fr]">
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
        </aside>
      </section>
    </div>
  );
}