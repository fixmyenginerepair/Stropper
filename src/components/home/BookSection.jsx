import { Link } from 'react-router-dom';
import BookCover from '@/components/book/BookCover';

export default function BookSection() {
  return (
    <section className="bg-navy py-12 text-white sm:py-16 lg:py-24">
      <div className="archive-container grid items-center gap-14 lg:grid-cols-2">
        <BookCover variant="bare" />

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