import StropAnimation from '@/components/book/StropAnimation';

const FRAMED =
  'book-cover overflow-hidden rounded-[10px] border border-hair bg-navy px-4 py-6 sm:px-8 sm:py-10 print:rounded-none print:border-0 print:bg-white print:p-0';
const BARE = 'book-cover mx-auto w-full max-w-[320px] print:max-w-none';

export default function BookCover({ count, variant = 'framed' }) {
  return (
    <section className={variant === 'bare' ? BARE : FRAMED}>
      <div className="mx-auto flex max-w-[420px] overflow-hidden rounded-l-[4px] rounded-r-[8px] bg-[#1016a3] shadow-[0_24px_50px_-18px_rgba(0,0,0,0.75)] print:shadow-none">
        <div className="w-3.5 shrink-0 bg-gradient-to-b from-oxblood-dark via-oxblood to-oxblood-dark sm:w-4" />

        <div className="min-w-0 flex-1 px-5 py-7 sm:px-8 sm:py-9">
          <p className="font-heading text-lg font-bold text-white sm:text-xl">Stropper.com</p>
          <svg
            viewBox="0 0 220 14"
            className="mt-2 h-3.5 w-[150px] sm:w-[180px]"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 5h150c22 0 42 2 66 8" stroke="#800000" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <div className="mt-7 flex flex-col items-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#5b62a6]">
              Stropper.com
            </p>
            <h2 className="mt-3 text-center font-heading text-[26px] font-bold leading-[1.1] text-white sm:text-3xl">
              The World of
              <br />
              Razor
              <br />
              Sharpeners
            </h2>

            <div className="mt-5 w-full">
              <StropAnimation />
            </div>

            <p className="mt-4 text-[11px] text-white/55">
              {count ? `${count} catalogued sharpeners` : 'The complete catalogue'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}