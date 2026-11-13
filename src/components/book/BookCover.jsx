import StropAnimation from '@/components/book/StropAnimation';

const FRAMED =
  'book-cover overflow-hidden rounded-[10px] border border-hair bg-navy px-4 py-8 sm:px-8 sm:py-12 print:rounded-none print:border-0 print:bg-white print:p-0';
const BARE = 'book-cover mx-auto w-full max-w-[340px] print:max-w-none';

// Fine grain used for both the cloth and the leather (pure SVG noise, no image files).
const grain = (opacity, freq = 0.9) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${opacity} 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

// Book-cloth: noise + crossed warp and weft threads + a soft light falling from the spine side.
const CLOTH = [
  grain(0.32),
  'repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px)',
  'repeating-linear-gradient(90deg, rgba(0,0,0,.09) 0 1px, transparent 1px 3px)',
  'radial-gradient(120% 90% at 18% 12%, rgba(255,255,255,.14), transparent 55%)',
  'linear-gradient(100deg, #1219a8 0%, #0f159b 55%, #0b1080 100%)',
].join(',');

// Oxblood leather: coarser grain over a rounded-spine shading.
const LEATHER = [
  grain(0.45, 0.65),
  'linear-gradient(90deg, #3a0000 0%, #7a0b0b 30%, #8e1414 48%, #6a0606 72%, #330000 100%)',
].join(',');

const LEATHER_CORNER = [grain(0.45, 0.65), 'linear-gradient(135deg, #8e1414, #5a0303)'].join(',');

const GOLD = 'linear-gradient(180deg, #f6e6a6 0%, #d9b45a 38%, #a9802a 62%, #f0d98c 100%)';

// Raised bands across the spine, like a hand-bound book.
const BANDS = [14, 34, 66, 86];

export default function BookCover({ count, variant = 'framed' }) {
  return (
    <section className={variant === 'bare' ? BARE : FRAMED}>
      <div className="book-3d group relative mx-auto max-w-[420px] pb-[10px] pr-[12px] [perspective:1400px] print:p-0">
        {/* Back board and page block, seen past the front cover */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[10px] right-0 top-[12px] rounded-r-[8px] rounded-l-[3px] print:hidden"
          style={{ background: '#080c6b', boxShadow: '0 30px 50px -18px rgba(0,0,0,.8)' }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[4px] left-[12px] right-[5px] top-[6px] rounded-r-[5px] print:hidden"
          style={{
            background:
              'repeating-linear-gradient(90deg, #f7f1e1 0 1px, #ddd2b6 1px 2px), linear-gradient(#efe6cf, #e6dbbf)',
            boxShadow: 'inset -2px -2px 3px rgba(0,0,0,.18)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[4px] left-[12px] right-[9px] h-[7px] print:hidden"
          style={{ background: 'repeating-linear-gradient(180deg, #f7f1e1 0 1px, #d8ccae 1px 2px)' }}
        />
        {/* Ribbon marker */}
        <div
          aria-hidden="true"
          className="absolute -bottom-[22px] left-[62%] h-[34px] w-[12px] print:hidden"
          style={{
            background: 'linear-gradient(90deg, #5a0000, #8e1414 50%, #5a0000)',
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)',
          }}
        />

        {/* Front cover */}
        <div
          className="relative flex overflow-hidden rounded-l-[3px] rounded-r-[8px] transition-transform duration-500 [transform-origin:left_center] [transform:rotateY(-7deg)] group-hover:[transform:rotateY(-2deg)] motion-reduce:[transform:none] print:[transform:none]"
          style={{ backgroundImage: CLOTH, boxShadow: '0 24px 50px -20px rgba(0,0,0,.75), inset -1px 0 0 rgba(255,255,255,.08)' }}
        >
          {/* Leather spine with raised bands and gilt rules */}
          <div className="relative w-[22px] shrink-0 sm:w-[26px]" style={{ backgroundImage: LEATHER }} aria-hidden="true">
            {BANDS.map((top) => (
              <span
                key={top}
                className="absolute inset-x-0 h-[7px]"
                style={{
                  top: `${top}%`,
                  background: 'linear-gradient(180deg, rgba(255,255,255,.18), rgba(0,0,0,.35))',
                  boxShadow: '0 1px 0 rgba(240,217,140,.45), 0 -1px 0 rgba(240,217,140,.45)',
                }}
              />
            ))}
          </div>
          {/* Hinge groove where cloth meets leather */}
          <div
            aria-hidden="true"
            className="w-[6px] shrink-0"
            style={{ background: 'linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.15) 60%, rgba(255,255,255,.06))' }}
          />

          {/* Leather corners */}
          <span aria-hidden="true" className="absolute right-0 top-0 h-[38px] w-[38px]" style={{ backgroundImage: LEATHER_CORNER, clipPath: 'polygon(0 0, 100% 0, 100% 100%)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.3)' }} />
          <span aria-hidden="true" className="absolute bottom-0 right-0 h-[38px] w-[38px]" style={{ backgroundImage: LEATHER_CORNER, clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }} />

          <div className="relative min-w-0 flex-1 px-5 py-7 sm:px-8 sm:py-9">
            {/* Gilt double rule */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-[9px] rounded-[3px]" style={{ border: '1px solid rgba(217,180,90,.55)' }} />
            <span aria-hidden="true" className="pointer-events-none absolute inset-[13px] rounded-[2px]" style={{ border: '1px solid rgba(217,180,90,.28)' }} />
            {['left-[6px] top-[6px]', 'right-[6px] top-[6px]', 'left-[6px] bottom-[6px]', 'right-[6px] bottom-[6px]'].map((pos) => (
              <span key={pos} aria-hidden="true" className={`pointer-events-none absolute ${pos} h-[7px] w-[7px] rotate-45`} style={{ background: GOLD, boxShadow: '0 0 0 1px rgba(0,0,0,.25)' }} />
            ))}

            <div className="relative">
              <p className="font-heading text-lg font-bold text-white sm:text-xl" style={{ textShadow: '0 1px 1px rgba(0,0,0,.45)' }}>
                Stropper.com
              </p>
              <svg viewBox="0 0 220 14" className="mt-2 h-3.5 w-[150px] sm:w-[180px]" fill="none" aria-hidden="true">
                <path d="M2 5h150c22 0 42 2 66 8" stroke="#8e1414" strokeWidth="4" strokeLinecap="round" />
              </svg>

              <div className="mt-7 flex flex-col items-center">
                {/* Blind-stamped (debossed) line */}
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.3em]"
                  style={{ color: 'rgba(4,6,60,.75)', textShadow: '0 1px 0 rgba(255,255,255,.14)' }}
                >
                  Stropper.com
                </p>
                {/* Gold-foil title */}
                <h2
                  className="mt-3 bg-clip-text text-center font-heading text-[26px] font-bold leading-[1.1] text-transparent sm:text-3xl print:text-[#b08a2e]"
                  style={{ backgroundImage: GOLD, filter: 'drop-shadow(0 1px 0 rgba(0,0,0,.55)) drop-shadow(0 -1px 0 rgba(255,255,255,.08))' }}
                >
                  The World of
                  <br />
                  Razor
                  <br />
                  Sharpeners
                </h2>
                <span aria-hidden="true" className="mt-4 flex items-center gap-2">
                  <span className="h-px w-10" style={{ background: GOLD }} />
                  <span className="h-[6px] w-[6px] rotate-45" style={{ background: GOLD }} />
                  <span className="h-px w-10" style={{ background: GOLD }} />
                </span>

                <div className="mt-4 w-full">
                  <StropAnimation />
                </div>

                <p className="mt-4 text-[11px] tracking-wide" style={{ color: 'rgba(240,217,140,.75)' }}>
                  {count ? `${count} catalogued sharpeners` : 'The complete catalogue'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
