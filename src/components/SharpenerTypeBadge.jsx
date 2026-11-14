const FAMILIES = [
  { match: 'Rollers', label: 'Roller', classes: 'bg-sky-100 text-sky-900 border-sky-300' },
  { match: 'Hone', label: 'Hone', classes: 'bg-violet-100 text-violet-900 border-violet-300' },
  { match: 'Strop', label: 'Strop', classes: 'bg-amber-100 text-amber-900 border-amber-300' },
  { match: 'Auto Strop', label: 'Auto Strop', classes: 'bg-rose-100 text-rose-900 border-rose-300' },
  { match: 'Pull String', label: 'Pull String', classes: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { match: 'Rotary Belt', label: 'Rotary Belt', classes: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
  { match: 'Magnetic', label: 'Magnetic', classes: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
  { match: 'Electric', label: 'Electric', classes: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
];

// Short, readable labels for the families that fall outside the eight headline groups.
const SHORT_LABELS = {
  Barber: 'Barber',
  'Barber Accessories': 'Barber',
  Accessories: 'Accessory',
  'Blade Holder & Hone': 'Blade Holder',
  'Blade Holder': 'Blade Holder',
  Blades: 'Blades',
  Circular: 'Circular',
  'Edge-Bak': 'Edge-Bak',
  'Handle-like Ingersoll': 'Handle-like',
  'Handle-like Valet': 'Handle-like',
  'Machine-Pull Handles': 'Handles',
  'Marbles-Bearings': 'Marbles',
  Marvel: 'Marvel',
  Other: 'Other',
  Set: 'Set',
  Sets: 'Set',
  'Shake Sharp': 'Shake Sharp',
  'Shaving Stand': 'Stand',
  'Safety Razor': 'Safety Razor',
  'Straight Razor': 'Straight Razor',
  'Allegro Type': 'Allegro',
  'Razor Other': 'Razor',
  Knife: 'Knife',
  Shear: 'Shear',
  Unknown: 'Unknown',
};

const FALLBACK_CLASSES = 'bg-slate-100 text-slate-700 border-slate-300';

export default function SharpenerTypeBadge({ type, className = '' }) {
  if (!type) return null;
  const family = FAMILIES.find((item) => String(type).startsWith(item.match));
  const label = family?.label || SHORT_LABELS[type] || String(type).split(' ')[0];
  const classes = family?.classes || FALLBACK_CLASSES;

  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-full border px-2 py-[3px] text-[10px] font-semibold uppercase leading-none tracking-[0.08em] shadow-sm ${classes} ${className}`}
    >
      {label}
    </span>
  );
}