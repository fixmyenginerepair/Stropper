// Realistic stropping animation for the book cover.
// A hollow-ground straight razor is drawn spine-first along an oxblood leather
// strop, rolls over on its spine at each end (as in real stropping), and returns.
const CSS = `
.strop-anim{width:100%;max-width:520px;margin:0 auto}
.strop-anim svg{display:block;width:100%;height:auto;overflow:visible}

/* 3.2s cycle: stroke right, roll over the spine, stroke left, roll back */
.sr-move{animation:sr-move 3.2s infinite}
.sr-burnish{animation:sr-move 3.2s infinite;animation-delay:.09s}
.sr-tilt{animation:sr-tilt 3.2s infinite;transform-origin:-12px 110px}
.sr-flip{animation:sr-flip 3.2s infinite}
.sr-spineflash{animation:sr-spineflash 3.2s infinite;opacity:0}
.sr-glint{animation:sr-glint 1.6s infinite}
.sr-reflect{animation:sr-reflect 1.6s infinite}
.sr-strop{animation:sr-strop 3.2s infinite}
.sr-ring{animation:sr-ring 3.2s infinite;transform-origin:40px 110px}

@keyframes sr-move{
  0%  {transform:translateX(112px);animation-timing-function:cubic-bezier(.5,.05,.3,1)}
  39% {transform:translateX(410px)}
  50% {transform:translateX(410px);animation-timing-function:cubic-bezier(.5,.05,.3,1)}
  89% {transform:translateX(112px)}
  100%{transform:translateX(112px)}
}
@keyframes sr-tilt{
  0%,100%{transform:rotate(0)}
  8%,33% {transform:rotate(-2deg)}
  39%,50%{transform:rotate(0)}
  58%,83%{transform:rotate(2deg)}
  89%    {transform:rotate(0)}
}
@keyframes sr-flip{
  0%,39%  {transform:translateY(0) scaleX(1);animation-timing-function:ease-in}
  44.5%   {transform:translateY(-3px) scaleX(.04);animation-timing-function:ease-out}
  50%,89% {transform:translateY(0) scaleX(-1);animation-timing-function:ease-in}
  94.5%   {transform:translateY(-3px) scaleX(-.04);animation-timing-function:ease-out}
  100%    {transform:translateY(0) scaleX(1)}
}
@keyframes sr-spineflash{
  0%,40%,49%,90%,99%,100%{opacity:0}
  44.5%,94.5%{opacity:.85}
}
@keyframes sr-glint{
  0%  {transform:translateY(0);opacity:0}
  12% {opacity:.95}
  66% {opacity:.95}
  78%,100%{transform:translateY(84px);opacity:0}
}
@keyframes sr-reflect{
  0%  {transform:translateY(-20px)}
  78%,100%{transform:translateY(140px)}
}
@keyframes sr-strop{
  0%,38%,50%,88%,100%{transform:translateY(0)}
  43%,93%{transform:translateY(.8px)}
}
@keyframes sr-ring{
  0%,38%,50%,88%,100%{transform:rotate(0)}
  43%{transform:rotate(-3deg)}
  93%{transform:rotate(3deg)}
}
@media (prefers-reduced-motion: reduce){
  .sr-move,.sr-burnish,.sr-tilt,.sr-flip,.sr-spineflash,.sr-glint,.sr-reflect,.sr-strop,.sr-ring{animation:none}
  .sr-move,.sr-burnish{transform:translateX(260px)}
}
`;

export default function StropAnimation() {
  return (
    <div
      className="strop-anim"
      aria-label="A straight razor being stropped on a leather strop"
      role="img"
    >
      <style>{CSS}</style>
      <svg viewBox="0 0 520 290" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sr-leather" x1="0" y1="74" x2="0" y2="146" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2a0806"/>
            <stop offset=".07" stopColor="#5e140e"/>
            <stop offset=".35" stopColor="#74201a"/>
            <stop offset=".7" stopColor="#561510"/>
            <stop offset=".94" stopColor="#4a120b"/>
            <stop offset="1" stopColor="#1c0503"/>
          </linearGradient>
          <linearGradient id="sr-wear" x1="60" y1="0" x2="460" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e8b08a" stopOpacity="0"/>
            <stop offset=".25" stopColor="#e8b08a" stopOpacity=".16"/>
            <stop offset=".75" stopColor="#e8b08a" stopOpacity=".16"/>
            <stop offset="1" stopColor="#e8b08a" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="sr-blade" x1="0" y1="0" x2="-24" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4f596b"/>
            <stop offset=".1" stopColor="#8b96a8"/>
            <stop offset=".17" stopColor="#f3f6f9"/>
            <stop offset=".33" stopColor="#a3aebe"/>
            <stop offset=".5" stopColor="#e6ebf0"/>
            <stop offset=".68" stopColor="#76829a"/>
            <stop offset=".83" stopColor="#d6dce4"/>
            <stop offset=".92" stopColor="#aeb8c6"/>
            <stop offset="1" stopColor="#f7f9fb"/>
          </linearGradient>
          <linearGradient id="sr-tang" x1="1" y1="0" x2="-15" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5d677a"/>
            <stop offset=".4" stopColor="#c9d1db"/>
            <stop offset="1" stopColor="#7d889b"/>
          </linearGradient>
          <linearGradient id="sr-horn" x1="-16" y1="0" x2="2" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#3b2518"/>
            <stop offset=".3" stopColor="#140c08"/>
            <stop offset=".55" stopColor="#4a2e1b"/>
            <stop offset=".75" stopColor="#1a0f09"/>
            <stop offset="1" stopColor="#0a0604"/>
          </linearGradient>
          <linearGradient id="sr-nickel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2f5f8"/>
            <stop offset=".45" stopColor="#9aa5b5"/>
            <stop offset="1" stopColor="#5a6476"/>
          </linearGradient>
          <linearGradient id="sr-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8a5530"/>
            <stop offset=".4" stopColor="#5e3519"/>
            <stop offset="1" stopColor="#2e180a"/>
          </linearGradient>
          <linearGradient id="sr-burnish" x1="-50" y1="0" x2="50" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffd3b4" stopOpacity="0"/>
            <stop offset=".5" stopColor="#ffd3b4" stopOpacity=".22"/>
            <stop offset="1" stopColor="#ffd3b4" stopOpacity="0"/>
          </linearGradient>
          <filter id="sr-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="1.4 .9" numOctaves="3" seed="4" result="n"/>
            <feDiffuseLighting in="n" lightingColor="#fff" surfaceScale="1.6" result="lit">
              <feDistantLight azimuth="235" elevation="58"/>
            </feDiffuseLighting>
            <feComposite in="lit" in2="SourceGraphic" operator="arithmetic" k1="1.25" k2="0" k3="0" k4="0"/>
          </filter>
          <filter id="sr-blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2"/></filter>
          <filter id="sr-blur5" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
          <clipPath id="sr-strop-clip"><rect x="52" y="74" width="412" height="72"/></clipPath>
          <clipPath id="sr-blade-clip">
            <path d="M0 60 Q0 50 -10 52 Q-22 55 -24 66 Q-26 112 -24 158 Q-22 164 -14 164 L0 164 Z"/>
          </clipPath>
        </defs>

        {/* shadow the hanging strop casts behind it */}
        <rect x="40" y="96" width="460" height="64" rx="10" fill="#000018" opacity=".55" filter="url(#sr-blur5)"/>

        <g className="sr-strop">
          {/* swivel hook + D-ring (left) */}
          <g className="sr-ring">
            <circle cx="12" cy="110" r="6" fill="none" stroke="url(#sr-nickel)" strokeWidth="3"/>
            <rect x="17" y="107" width="8" height="6" rx="2" fill="url(#sr-nickel)"/>
            <path d="M40 86 L32 86 Q22 110 32 134 L40 134" fill="none" stroke="url(#sr-nickel)" strokeWidth="4" strokeLinecap="round"/>
            <path d="M25 110 L28 110" stroke="#9aa5b5" strokeWidth="4"/>
          </g>
          <rect x="38" y="80" width="8" height="60" rx="3" fill="url(#sr-nickel)"/>

          {/* leather: thickness edge, face, grain, wear track */}
          <rect x="44" y="146" width="424" height="4" fill="#240604"/>
          <rect x="44" y="74" width="424" height="72" fill="url(#sr-leather)" filter="url(#sr-grain)"/>
          <rect x="60" y="80" width="396" height="60" fill="url(#sr-wear)"/>
          <path d="M60 100 Q260 97 456 101" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="1"/>
          <path d="M60 123 Q260 126 456 121" fill="none" stroke="#fff" strokeOpacity=".05" strokeWidth="1.2"/>
          <rect x="44" y="74" width="424" height="1" fill="#fff" opacity=".18"/>
          {/* creased edge lines */}
          <path d="M66 80.5 H452 M66 139.5 H452" stroke="#140302" strokeOpacity=".55" strokeWidth="1"/>
          <path d="M66 81.6 H452 M66 140.6 H452" stroke="#ffcfae" strokeOpacity=".12" strokeWidth=".8"/>
          {/* folded end at the hardware, riveted */}
          <rect x="44" y="74" width="22" height="72" fill="#3a0c08" opacity=".55"/>
          <path d="M66 74 L66 146" stroke="#1a0402" strokeWidth="1.2"/>
          <circle cx="56" cy="92" r="2.6" fill="url(#sr-nickel)"/>
          <circle cx="56" cy="128" r="2.6" fill="url(#sr-nickel)"/>

          {/* burnish that follows the stroke */}
          <g clipPath="url(#sr-strop-clip)">
            <g className="sr-burnish"><rect x="-50" y="74" width="100" height="72" fill="url(#sr-burnish)"/></g>
          </g>

          {/* handle (right): leather wrap over a turned wooden grip */}
          <rect x="452" y="72" width="22" height="76" rx="2" fill="#3a0c08"/>
          <rect x="452" y="72" width="22" height="76" rx="2" fill="url(#sr-leather)" opacity=".7" filter="url(#sr-grain)"/>
          <circle cx="463" cy="88" r="2.6" fill="url(#sr-nickel)"/>
          <circle cx="463" cy="132" r="2.6" fill="url(#sr-nickel)"/>
          <path d="M474 82 L494 86 Q510 88 512 110 Q510 132 494 134 L474 138 Z" fill="url(#sr-wood)"/>
          <path d="M478 92 Q495 94 505 104" fill="none" stroke="#c48a5a" strokeOpacity=".35" strokeWidth="1.2"/>
          <path d="M478 126 Q495 125 505 117" fill="none" stroke="#000" strokeOpacity=".3" strokeWidth="1"/>
        </g>

        {/* the razor */}
        <g className="sr-move">
          <g className="sr-tilt">
            <g className="sr-flip">
              {/* contact shadows */}
              <path d="M0 64 L-24 70 L-24 160 L0 166 Z" fill="#000" opacity=".5" filter="url(#sr-blur2)" transform="translate(0 3)"/>
              <path d="M-15 190 Q-17 232 -13 276 L-1 276 Q3 232 1 190 Z" fill="#000010" opacity=".55" filter="url(#sr-blur5)" transform="translate(0 9)"/>

              {/* scales (horn), open and trailing from the tang */}
              <path d="M-15 186 Q-17 230 -13 274 Q-7 282 -1 274 Q3 230 1 186 Q-7 181 -15 186Z" fill="url(#sr-horn)"/>
              <path d="M-12 192 Q-13.5 232 -10.5 268" fill="none" stroke="#e8c49a" strokeOpacity=".22" strokeWidth="1.6"/>
              <circle cx="-7" cy="270" r="2.4" fill="url(#sr-nickel)"/>

              {/* tang with jimps */}
              <path d="M1 163 L1 190 Q-6 196 -14 190 L-15 172 Q-15 165 -11 163 Z" fill="url(#sr-tang)"/>
              <path d="M1 168 h-3 M1 171 h-3 M1 174 h-3 M1 177 h-3 M1 180 h-3 M1 183 h-3" stroke="#3f4858" strokeWidth=".8"/>
              <circle cx="-7" cy="190" r="3.4" fill="url(#sr-nickel)"/>
              <circle cx="-7" cy="190" r="1.4" fill="#5a6476"/>

              {/* blade: hollow-ground steel */}
              <path d="M0 60 Q0 50 -10 52 Q-22 55 -24 66 Q-26 112 -24 158 Q-22 164 -14 164 L0 164 Z" fill="url(#sr-blade)" stroke="#3a4252" strokeWidth=".6"/>
              {/* spine */}
              <path d="M0 58 L0 164 L-3 164 L-3 56 Q-1.5 55.5 0 58Z" fill="#59647a"/>
              <path d="M-.6 60 L-.6 162" stroke="#dfe5ec" strokeOpacity=".6" strokeWidth=".6"/>
              {/* maker's etch */}
              <path d="M-9 120 h-6 M-9 124 h-8 M-9 128 h-5" stroke="#5d6879" strokeOpacity=".45" strokeWidth=".7"/>
              {/* honed edge */}
              <path d="M-24 66 Q-26 112 -24 158" fill="none" stroke="#fff" strokeWidth=".9"/>
              {/* moving reflection across the hollow + glint on the edge */}
              <g clipPath="url(#sr-blade-clip)">
                <g className="sr-reflect">
                  <rect x="-30" y="40" width="36" height="16" fill="#fff" opacity=".38" transform="skewY(-28)"/>
                </g>
              </g>
              <g className="sr-glint">
                <ellipse cx="-24.5" cy="72" rx="2.5" ry="7" fill="#fff" filter="url(#sr-blur2)"/>
                <ellipse cx="-24.5" cy="72" rx=".8" ry="3" fill="#fff"/>
              </g>
            </g>
            {/* spine catching the light as it rolls */}
            <rect className="sr-spineflash" x="-1.5" y="56" width="3" height="108" rx="1.5" fill="#fff"/>
          </g>
        </g>
      </svg>
    </div>
  );
}
