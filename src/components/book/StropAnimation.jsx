const CSS = `
  .strop-anim{width:100%;max-width:520px;margin:0 auto}
  .strop-anim svg{display:block;width:100%;height:auto;overflow:visible}

  /* Razor travel: slide right, flip on spine, slide left, flip */
  .sa-move{animation:sa-move 4.2s infinite}
  .sa-flip{animation:sa-flip 4.2s infinite}
  .sa-sheen{animation:sa-move 4.2s infinite;animation-delay:.12s}
  .sa-glint{animation:sa-glint 2.1s linear infinite}
  .sa-spark-r{animation:sa-spark-r 4.2s infinite;transform-box:fill-box;transform-origin:center}
  .sa-spark-l{animation:sa-spark-l 4.2s infinite;transform-box:fill-box;transform-origin:center}
  .sa-ring{animation:sa-ring 4.2s infinite;transform-box:fill-box;transform-origin:center}

  @keyframes sa-move{
    0%  {transform:translateX(95px); animation-timing-function:cubic-bezier(.45,0,.25,1)}
    42% {transform:translateX(420px)}
    50% {transform:translateX(420px); animation-timing-function:cubic-bezier(.45,0,.25,1)}
    92% {transform:translateX(95px)}
    100%{transform:translateX(95px)}
  }
  @keyframes sa-flip{
    0%,40% {transform:scale(1,1)}
    46%    {transform:scale(0,1.06)}
    50%,90%{transform:scale(-1,1)}
    96%    {transform:scale(0,1.06)}
    100%   {transform:scale(1,1)}
  }
  @keyframes sa-glint{
    0%  {transform:translateY(0);opacity:0}
    15% {opacity:1}
    70% {opacity:1}
    85%,100%{transform:translateY(88px);opacity:0}
  }
  @keyframes sa-spark-r{
    0%,40%{transform:scale(0) rotate(0);opacity:0}
    46%   {transform:scale(1.2) rotate(45deg);opacity:1}
    54%,100%{transform:scale(0) rotate(90deg);opacity:0}
  }
  @keyframes sa-spark-l{
    0%,90%{transform:scale(0) rotate(0);opacity:0}
    96%   {transform:scale(1.2) rotate(45deg);opacity:1}
    100%  {transform:scale(0) rotate(90deg);opacity:0}
  }
  @keyframes sa-ring{
    0%,6% {transform:rotate(0)}
    48%   {transform:rotate(-6deg)}
    96%   {transform:rotate(4deg)}
    100%  {transform:rotate(0)}
  }
  @media (prefers-reduced-motion: reduce){
    .sa-move,.sa-flip,.sa-sheen,.sa-glint,.sa-spark-r,.sa-spark-l,.sa-ring{animation:none}
    .sa-move,.sa-sheen{transform:translateX(260px)}
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
          <linearGradient id="sa-leather" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8a1a12" />
            <stop offset=".45" stopColor="#6b0000" />
            <stop offset="1" stopColor="#4a0000" />
          </linearGradient>
          <linearGradient id="sa-steel" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#f4f7fb" />
            <stop offset=".35" stopColor="#c9d2de" />
            <stop offset=".7" stopColor="#8e9aac" />
            <stop offset="1" stopColor="#5f6b7d" />
          </linearGradient>
          <linearGradient id="sa-scale" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3a3a46" />
            <stop offset=".4" stopColor="#15151d" />
            <stop offset="1" stopColor="#050508" />
          </linearGradient>
          <linearGradient id="sa-handle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a0d08" />
            <stop offset="1" stopColor="#2e0000" />
          </linearGradient>
          <radialGradient id="sa-sheen-g" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#ffb08a" stopOpacity=".55" />
            <stop offset="1" stopColor="#ffb08a" stopOpacity="0" />
          </radialGradient>
          <filter id="sa-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="sa-grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n" />
            <feColorMatrix
              in="n"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"
            />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <clipPath id="sa-strop-clip">
            <rect x="42" y="72" width="428" height="76" rx="3" />
          </clipPath>
        </defs>

        {/* Soft floor glow */}
        <ellipse cx="260" cy="160" rx="250" ry="60" fill="#2a2aa8" opacity=".25" filter="url(#sa-soft)" />

        {/* D-ring hardware (left) */}
        <g className="sa-ring">
          <path d="M44 84 L28 84 Q12 110 28 136 L44 136" fill="none" stroke="#c9d2de" strokeWidth="5" strokeLinecap="round" />
          <rect x="36" y="80" width="12" height="60" rx="3" fill="#8e9aac" />
          <circle cx="42" cy="92" r="2" fill="#5f6b7d" />
          <circle cx="42" cy="128" r="2" fill="#5f6b7d" />
        </g>

        {/* Strop leather */}
        <g>
          <rect x="42" y="72" width="428" height="76" rx="3" fill="url(#sa-leather)" />
          <rect x="42" y="72" width="428" height="76" rx="3" fill="#000" filter="url(#sa-grain)" />
          <rect x="42" y="72" width="428" height="4" fill="#fff" opacity=".08" />
          <line x1="52" y1="80" x2="460" y2="80" stroke="#e9c9a8" strokeOpacity=".55" strokeWidth="1.4" strokeDasharray="6 5" />
          <line x1="52" y1="140" x2="460" y2="140" stroke="#e9c9a8" strokeOpacity=".55" strokeWidth="1.4" strokeDasharray="6 5" />
          {/* burnish sheen that trails the razor */}
          <g clipPath="url(#sa-strop-clip)">
            <g className="sa-sheen">
              <ellipse cx="0" cy="110" rx="70" ry="44" fill="url(#sa-sheen-g)" />
            </g>
          </g>
        </g>

        {/* Handle (right) */}
        <path d="M470 76 L500 86 Q512 110 500 134 L470 144 Z" fill="url(#sa-handle)" />
        <line x1="476" y1="84" x2="476" y2="136" stroke="#e9c9a8" strokeOpacity=".45" strokeWidth="1.2" strokeDasharray="4 4" />

        {/* Sparks at the turnarounds */}
        <g transform="translate(452 66)">
          <path className="sa-spark-r" d="M0 -11 L2.5 -2.5 L11 0 L2.5 2.5 L0 11 L-2.5 2.5 L-11 0 L-2.5 -2.5Z" fill="#fff" />
        </g>
        <g transform="translate(466 156)">
          <path className="sa-spark-r" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6Z" fill="#ffd2c2" />
        </g>
        <g transform="translate(62 66)">
          <path className="sa-spark-l" d="M0 -11 L2.5 -2.5 L11 0 L2.5 2.5 L0 11 L-2.5 2.5 L-11 0 L-2.5 -2.5Z" fill="#fff" />
        </g>
        <g transform="translate(50 156)">
          <path className="sa-spark-l" d="M0 -7 L1.6 -1.6 L7 0 L1.6 1.6 L0 7 L-1.6 1.6 L-7 0 L-1.6 -1.6Z" fill="#ffd2c2" />
        </g>

        {/* Straight razor (spine leads, edge trails, flips on its spine) */}
        <g className="sa-move">
          <g className="sa-flip">
            {/* shadow */}
            <ellipse cx="-4" cy="160" rx="18" ry="96" fill="#000" opacity=".35" filter="url(#sa-soft)" />
            {/* scales */}
            <path d="M-10 168 Q-14 215 -7 258 Q0 266 7 258 Q14 215 10 168 Q0 162 -10 168Z" fill="url(#sa-scale)" />
            <path d="M-6 175 Q-9 215 -4 250" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
            <circle cx="0" cy="176" r="2.6" fill="#c9d2de" />
            <circle cx="0" cy="250" r="2.6" fill="#c9d2de" />
            {/* tang / shoulder */}
            <path d="M11 156 L11 176 Q0 184 -7 176 L-11 156Z" fill="#8e9aac" />
            {/* blade */}
            <path d="M11 62 L11 158 L-11 158 Q-15 110 -13 72 Q-11 58 0 56 Q9 56 11 62Z" fill="url(#sa-steel)" />
            {/* spine */}
            <path d="M7 60 L11 62 L11 158 L7 158Z" fill="#4a5466" />
            {/* honed edge line */}
            <path d="M-13 72 Q-15 110 -11 158" fill="none" stroke="#fff" strokeWidth="1.6" />
            {/* traveling glint along edge */}
            <g className="sa-glint">
              <ellipse cx="-11" cy="68" rx="5" ry="9" fill="#fff" filter="url(#sa-soft)" />
              <ellipse cx="-11" cy="68" rx="1.6" ry="4" fill="#fff" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}