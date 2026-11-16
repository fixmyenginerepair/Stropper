// How-it-works illustrations. Each mechanism is an animated SVG (viewBox 0 0 400 240)
// plus a short explanation. `types` are the Sharpener.type values it covers.

const C = {
  cream: '#f7f3ea',
  leather: '#b9783e',
  leatherDark: '#8a5428',
  stone: '#8f95ad',
  blade: '#e4e8f2',
  edge: '#ff8a7a',
  dim: 'rgba(247,243,234,.35)',
};

const speckles = (x, y, w, h, n = 26, seed = 7) => {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let out = '';
  for (let i = 0; i < n; i += 1) {
    out += `<circle cx="${(x + r() * w).toFixed(1)}" cy="${(y + r() * h).toFixed(1)}" r="${(0.8 + r() * 1.4).toFixed(1)}" fill="rgba(255,255,255,.35)"/>`;
  }
  return out;
};

const label = (x, y, text, anchor = 'middle') =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" class="hw-label">${text}</text>`;

const crank = (cx, cy, r = 22) => `
  <circle cx="${cx}" cy="${cy}" r="5" fill="${C.cream}"/>
  <g class="hw-spin" style="transform-origin:${cx}px ${cy}px">
    <line x1="${cx}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${C.cream}" stroke-width="5" stroke-linecap="round"/>
    <rect x="${cx + r - 4}" y="${cy - 14}" width="8" height="16" rx="4" fill="${C.cream}"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r + 9}" fill="none" stroke="${C.dim}" stroke-width="1.5" stroke-dasharray="3 5"/>`;

const roller = (cx, cy, r, dir = 'hw-spin') => `
  <g class="${dir}" style="transform-origin:${cx}px ${cy}px">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.leather}" stroke="${C.cream}" stroke-width="3"/>
    <line x1="${cx - r + 4}" y1="${cy}" x2="${cx + r - 4}" y2="${cy}" stroke="${C.leatherDark}" stroke-width="3"/>
    <line x1="${cx}" y1="${cy - r + 4}" x2="${cx}" y2="${cy + r - 4}" stroke="${C.leatherDark}" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="${C.cream}"/>
  </g>`;

// A blade seen edge-on as a bar, with its working edge in red.
const bladeBar = (x, y, w, h = 8) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${C.blade}"/>
  <rect x="${x}" y="${y + h - 2.5}" width="${w}" height="2.5" fill="${C.edge}"/>`;

export const HOW_IT_WORKS_CSS = `
.hw-svg{display:block;width:100%;height:auto}
.hw-label{font:600 11px Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;fill:rgba(247,243,234,.7)}
.hw-svg *{transform-box:view-box}
.hw-spin{animation:hw-spin 2.4s linear infinite}
.hw-spin-rev{animation:hw-spin 2.4s linear infinite reverse}
@keyframes hw-spin{to{transform:rotate(360deg)}}
.hw-slide{animation:hw-slide 3.2s ease-in-out infinite}
@keyframes hw-slide{0%,100%{transform:translateX(-60px)}50%{transform:translateX(60px)}}
.hw-slide-wide{animation:hw-slide-wide 3.6s ease-in-out infinite}
@keyframes hw-slide-wide{0%,100%{transform:translateX(0)}50%{transform:translateX(190px)}}
.hw-tilt{animation:hw-tilt 3.2s ease-in-out infinite}
@keyframes hw-tilt{0%,44%{transform:rotate(26deg)}56%,94%{transform:rotate(-26deg)}100%{transform:rotate(26deg)}}
.hw-flipx{animation:hw-flipx 3.6s ease-in-out infinite}
@keyframes hw-flipx{0%,44%{transform:scaleX(1)}50%,94%{transform:scaleX(-1)}100%{transform:scaleX(1)}}
.hw-flipy{animation:hw-flipy 3.6s ease-in-out infinite}
@keyframes hw-flipy{0%,44%{transform:scaleY(1)}50%,94%{transform:scaleY(-1)}100%{transform:scaleY(1)}}
.hw-updown{animation:hw-updown 3.6s ease-in-out infinite}
@keyframes hw-updown{0%,44%{transform:translateY(-21px)}54%,94%{transform:translateY(21px)}100%{transform:translateY(-21px)}}
.hw-orbit{animation:hw-spin 1.1s linear infinite}
.hw-orbit-keep{animation:hw-spin 1.1s linear infinite reverse}
.hw-rub{animation:hw-rub 1.6s ease-in-out infinite}
@keyframes hw-rub{0%,100%{transform:translate(-70px,0)}25%{transform:translate(0,-3px)}50%{transform:translate(70px,0)}75%{transform:translate(0,-3px)}}
.hw-drum{animation:hw-spin 4s linear infinite}
.hw-arrow{animation:hw-arrow 3.2s ease-in-out infinite}
@keyframes hw-arrow{0%,44%{opacity:1}50%,94%{opacity:0}100%{opacity:1}}
.hw-arrow-b{animation:hw-arrow 3.2s ease-in-out infinite;animation-delay:-1.6s}
.hw-paused *{animation-play-state:paused!important}
`;

const frame = (inner) =>
  `<svg class="hw-svg" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;

export const MECHANISMS = [
  {
    key: 'pull-handles',
    title: 'Pull-handle stropper',
    short: 'Pull the strop back and forth; the blade tips over by itself.',
    types: ['Machine-Pull Handles'],
    steps: [
      'The blade is clamped in a small frame that sits on a leather strop, with a handle at each end of the strop.',
      'You pull the handles back and forth, drawing the leather under the blade.',
      'Each time the strop changes direction, the frame tips the blade over, so the edge always trails and both sides get stropped.',
    ],
    svg: frame(`
      <g class="hw-slide">
        <rect x="-20" y="150" width="440" height="18" rx="3" fill="${C.leather}"/>
        <line x1="-20" y1="159" x2="420" y2="159" stroke="${C.leatherDark}" stroke-width="1.5" stroke-dasharray="6 6"/>
        <rect x="-44" y="138" width="30" height="42" rx="8" fill="${C.cream}"/>
        <rect x="414" y="138" width="30" height="42" rx="8" fill="${C.cream}"/>
      </g>
      <rect x="150" y="70" width="100" height="98" rx="12" fill="none" stroke="${C.cream}" stroke-width="3"/>
      <g class="hw-tilt" style="transform-origin:200px 150px">
        <line x1="200" y1="150" x2="200" y2="92" stroke="${C.blade}" stroke-width="7" stroke-linecap="round"/>
        <circle cx="200" cy="150" r="4.5" fill="${C.edge}"/>
        <circle cx="200" cy="108" r="6" fill="none" stroke="${C.cream}" stroke-width="2.5"/>
      </g>
      <g class="hw-arrow">${label(200, 214, 'pull right →')}</g>
      <g class="hw-arrow-b">${label(200, 214, '← pull left')}</g>
      ${label(200, 52, 'blade holder')}
    `),
  },
  {
    key: 'rollers',
    title: 'Roller stropper',
    short: 'Turn the crank; leather rollers spin against the blade.',
    types: ['Rollers-1', 'Rollers-2', 'Rollers-3', 'Rollers-4'],
    steps: [
      'The blade sits in a slot inside the case, with its edges against one or more leather (or abrasive) rollers.',
      'Turning the crank spins the rollers, which wipe along the edges in the stropping direction.',
      'Machines are grouped by how many rollers they use, from one to four. Twinplex used two.',
    ],
    svg: frame(`
      <rect x="70" y="40" width="220" height="160" rx="16" fill="none" stroke="${C.cream}" stroke-width="3"/>
      ${roller(180, 82, 34)}
      ${roller(180, 158, 34, 'hw-spin-rev')}
      ${bladeBar(110, 116, 140, 8)}
      <rect x="110" y="116" width="140" height="2.5" fill="${C.edge}"/>
      <line x1="214" y1="82" x2="318" y2="120" stroke="${C.dim}" stroke-width="2" stroke-dasharray="4 4"/>
      ${crank(330, 120)}
      ${label(180, 228, 'blade between the rollers')}
    `),
  },
  {
    key: 'circular',
    title: 'Rotary stropper',
    short: 'The blade travels round a leather ring and flips over on the way.',
    types: ['Circular'],
    steps: [
      'The case holds a ring of leather. The blade is carried on an arm inside it, with its edge against the leather.',
      'Turning the handle swings the blade round and round the ring.',
      'Partway round, the mechanism lifts the blade and turns it over so the other side is stropped. Kriss Kross made this famous.',
    ],
    svg: frame(`
      <circle cx="190" cy="120" r="88" fill="none" stroke="${C.leather}" stroke-width="20"/>
      <circle cx="190" cy="120" r="99" fill="none" stroke="${C.cream}" stroke-width="2.5"/>
      <g class="hw-drum" style="transform-origin:190px 120px">
        <line x1="190" y1="120" x2="190" y2="52" stroke="${C.cream}" stroke-width="4"/>
        <g class="hw-flipy" style="transform-origin:190px 48px">
          <rect x="164" y="40" width="52" height="10" rx="2" fill="${C.blade}"/>
          <rect x="164" y="37.5" width="52" height="2.5" fill="${C.edge}"/>
        </g>
      </g>
      <circle cx="190" cy="120" r="8" fill="${C.cream}"/>
      ${crank(340, 120, 18)}
      ${label(190, 234, 'leather ring')}
    `),
  },
  {
    key: 'allegro',
    title: 'Hone-and-strop box (Allegro type)',
    short: 'A carriage runs the blade over a stone one way and leather the other.',
    types: ['Allegro Type'],
    steps: [
      'Inside the box is a honing stone on one side and a leather strop on the other, with a blade carriage running between them.',
      'Turning the handle drives the carriage from end to end.',
      'Going one way the blade presses on the stone; at the end it flips and comes back along the leather.',
    ],
    svg: frame(`
      <rect x="40" y="56" width="280" height="128" rx="12" fill="none" stroke="${C.cream}" stroke-width="3"/>
      <rect x="52" y="66" width="256" height="24" rx="3" fill="${C.stone}"/>
      ${speckles(52, 66, 256, 24, 40)}
      <rect x="52" y="150" width="256" height="24" rx="3" fill="${C.leather}"/>
      <g class="hw-slide-wide">
        <g class="hw-updown">
          <rect x="70" y="104" width="24" height="32" rx="4" fill="none" stroke="${C.cream}" stroke-width="2.5"/>
          <rect x="74" y="98" width="16" height="44" rx="2" fill="${C.blade}"/>
          <rect x="74" y="98" width="16" height="3" fill="${C.edge}"/>
          <rect x="74" y="139" width="16" height="3" fill="${C.edge}"/>
        </g>
      </g>
      ${crank(355, 120, 18)}
      ${label(180, 48, 'stone')}
      ${label(180, 206, 'leather')}
    `),
  },
  {
    key: 'pull-string',
    title: 'Pull-cord sharpener (Siemens type)',
    short: 'Hang it on a hook and pull the box along the cord.',
    types: ['Pull String'],
    steps: [
      'Loop the cord over a hook and hold the knob so the cord is tight.',
      'Run the box back and forth along the cord, about fifteen times. The cord turns two little eccentric pins inside.',
      'The blade sits on the pins, so it is swept round in small circles between the grinding stones.',
    ],
    svg: frame(`
      <path d="M22 98 q0 -22 18 -22 q18 0 18 22" fill="none" stroke="${C.cream}" stroke-width="4"/>
      <line x1="40" y1="100" x2="370" y2="100" stroke="${C.cream}" stroke-width="2.5"/>
      <circle cx="376" cy="100" r="10" fill="${C.cream}"/>
      <g class="hw-slide" style="transform-origin:0 0">
        <g transform="translate(140,0)">
          <rect x="0" y="66" width="120" height="96" rx="14" fill="#0b0b7a" stroke="${C.cream}" stroke-width="3"/>
          <rect x="10" y="132" width="100" height="20" rx="3" fill="${C.stone}"/>
          ${speckles(10, 132, 100, 20, 18, 3)}
          <g class="hw-orbit" style="transform-origin:60px 112px">
            <g transform="translate(0,-7)">
              <g class="hw-orbit-keep" style="transform-origin:60px 112px">
                <rect x="28" y="106" width="64" height="12" rx="2" fill="${C.blade}"/>
                <rect x="28" y="115.5" width="64" height="2.5" fill="${C.edge}"/>
                <circle cx="44" cy="112" r="3" fill="${C.cream}"/>
                <circle cx="76" cy="112" r="3" fill="${C.cream}"/>
              </g>
            </g>
          </g>
        </g>
      </g>
      ${label(200, 206, 'blade circles over the stones')}
    `),
  },
  {
    key: 'self-stropping',
    title: 'Self-stropping razor',
    short: 'Run the whole razor along the strop; the blade never comes out.',
    types: ['Handle-like Valet', 'Auto Strop'],
    steps: [
      'The strop is threaded through the head of the razor, with the blade still inside.',
      'You slide the razor up and down the strop, as a barber strops a straight razor.',
      'At each end the blade tips over against the leather, so both edges are stropped. The Valet AutoStrop and the Wilkinson Empire both worked this way.',
    ],
    svg: frame(`
      <path d="M22 118 q0 -24 18 -24 q18 0 18 24" fill="none" stroke="${C.cream}" stroke-width="4"/>
      <rect x="40" y="114" width="320" height="14" rx="2" fill="${C.leather}"/>
      <rect x="356" y="104" width="30" height="34" rx="8" fill="${C.cream}"/>
      <g class="hw-slide-wide" style="transform-origin:0 0">
        <g transform="translate(-20,0)">
          <rect x="72" y="100" width="64" height="42" rx="8" fill="none" stroke="${C.cream}" stroke-width="3"/>
          <line x1="104" y1="142" x2="104" y2="212" stroke="${C.cream}" stroke-width="9" stroke-linecap="round"/>
          <g class="hw-flipy" style="transform-origin:104px 121px">
            <rect x="80" y="104" width="48" height="6" rx="1" fill="${C.blade}"/>
            <rect x="80" y="110" width="48" height="2.5" fill="${C.edge}"/>
          </g>
        </g>
      </g>
      ${label(200, 70, 'strop runs through the razor head')}
    `),
  },
  {
    key: 'blade-holder',
    title: 'Blade holder',
    short: 'A handle that clamps the blade so you can strop or hone it by hand.',
    types: ['Handle-like Ingersoll', 'Blade Holder', 'Blade Holder & Hone'],
    steps: [
      'The blade is clamped in a holder with a handle, like a tiny straight razor.',
      'You stroke it along a strop (or a stone, on models that include one), spine first.',
      'Between strokes you turn the holder over to work the other side. Ingersoll’s strop holders worked this way.',
    ],
    svg: frame(`
      <rect x="30" y="156" width="340" height="22" rx="4" fill="${C.leather}"/>
      <line x1="30" y1="167" x2="370" y2="167" stroke="${C.leatherDark}" stroke-width="1.5" stroke-dasharray="6 6"/>
      <g class="hw-slide-wide" style="transform-origin:0 0">
        <g transform="translate(-10,0)">
          <g class="hw-flipx" style="transform-origin:110px 140px">
            <rect x="78" y="134" width="64" height="20" rx="3" fill="none" stroke="${C.cream}" stroke-width="3"/>
            <rect x="82" y="148" width="56" height="8" rx="1" fill="${C.blade}"/>
            <rect x="82" y="153.5" width="56" height="2.5" fill="${C.edge}"/>
            <line x1="138" y1="136" x2="190" y2="90" stroke="${C.cream}" stroke-width="9" stroke-linecap="round"/>
          </g>
        </g>
      </g>
      ${label(200, 210, 'strop or stone')}
    `),
  },
  {
    key: 'hone',
    title: 'Hone (stone or glass)',
    short: 'Rub the blade on a fine stone or glass to set a new edge.',
    types: ['Hone-Carborundum', 'Hone-Glass/Other'],
    steps: [
      'The blade, often in a little holder, is rubbed over a fine abrasive: Carborundum stone, or a ridged or frosted glass plate.',
      'A few light strokes grind away the dulled edge and set a new one.',
      'Glass hones were cheap and popular. An old home trick did the same job: rubbing the blade around the inside of a drinking glass.',
    ],
    svg: frame(`
      <rect x="60" y="146" width="280" height="38" rx="6" fill="${C.stone}"/>
      ${speckles(60, 146, 280, 38, 70, 11)}
      <rect x="60" y="146" width="280" height="38" rx="6" fill="none" stroke="${C.cream}" stroke-width="2.5"/>
      <g class="hw-rub" style="transform-origin:0 0">
        <rect x="160" y="126" width="80" height="18" rx="4" fill="none" stroke="${C.cream}" stroke-width="3"/>
        <rect x="166" y="138" width="68" height="8" rx="1" fill="${C.blade}"/>
        <rect x="166" y="143.5" width="68" height="2.5" fill="${C.edge}"/>
        <path d="M184 126 v-34 h32 v34" fill="none" stroke="${C.cream}" stroke-width="3"/>
      </g>
      ${label(200, 214, 'stone or glass')}
    `),
  },
];

export const mechanismForType = (type) =>
  type ? MECHANISMS.find((m) => m.types.includes(type)) || null : null;
