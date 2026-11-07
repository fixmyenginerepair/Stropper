import { Link } from 'react-router-dom';
import { SITE } from '@/lib/site';

export default function BookSection() {
  return (
    <section className="bg-navy py-16 text-white lg:py-24">
      <div className="archive-container grid items-center gap-14 lg:grid-cols-2">
        <div className="flex justify-center">
          <div className="relative w-[230px] rounded-l-[3px] rounded-r-[8px] border-l-[14px] border-oxblood bg-[#0b0b7d] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:w-[260px]">
            <div className="flex aspect-[3/4] flex-col p-6">
              <img src={SITE.logo} alt="" className="h-8 w-auto object-contain object-left" />
              <div className="mt-auto">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                  Stropper.com
                </p>
                <p className="mt-2 font-heading text-[22px] font-bold leading-tight">
                  The World of Razor Sharpeners
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow text-white/55">The book</p>
          <h2 className="mt-4 max-w-xl font-heading text-3xl font-bold leading-tight sm:text-[2.4rem]">
            Print the entire archive as a book
          </h2>
          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-white/70">
            Generate a print-ready PDF of every sharpener — or just the ones you care about.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/book?scope=all"
              className="rounded-lg bg-oxblood px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark"
            >
              Build the full book (PDF)
            </Link>
            <Link
              to="/book"
              className="rounded-lg border border-white/35 px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:border-white"
            >
              Build from a search
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}