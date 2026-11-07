export const SHARPENER_TYPES = [
  'Allegro Type',
  'Auto Strop',
  'Barber',
  'Rotary Belt',
  'Accessories',
  'Blade Holder & Hone',
  'Blade Holder',
  'Blades',
  'Circular',
  'Edge-Bak',
  'Electric',
  'Handle-like Ingersoll',
  'Handle-like Valet',
  'Hone-Carborundum',
  'Hone-Glass/Other',
  'Machine-Pull Handles',
  'Magnetic',
  'Marbles-Bearings',
  'Marvel',
  'Other',
  'Pull String',
  'Rollers-1',
  'Rollers-2',
  'Rollers-3',
  'Rollers-4',
  'Safety Razor',
  'Set',
  'Shake Sharp',
  'Shaving Stand',
  'Straight Razor',
  'Strop',
  'Unknown',
];

export const COUNTRY_VALUES = [
  'Argentina',
  'Australia',
  'Austria',
  'Brazil',
  'Canada',
  'Czechoslovakia',
  'Denmark',
  'England',
  'France',
  'Germany',
  'Holland',
  'Hungary',
  'Italy',
  'Japan',
  'Netherland',
  'Norway',
  'Other',
  'Poland',
  'Russia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Unknown',
  'USA',
];

// The eight headline families on the home page. `match` is the prefix used
// against the archive's type field, so "Rollers" finds Rollers-1 … Rollers-4.
export const TYPE_GROUPS = [
  {
    label: 'Strops',
    match: 'Strop',
    blurb: 'Leather, canvas and linen strops that realign a blade’s edge.',
  },
  {
    label: 'Rollers',
    match: 'Rollers',
    blurb: 'Clamp-and-roll devices that brought the edge back to life.',
  },
  {
    label: 'Auto Strop',
    match: 'Auto Strop',
    blurb: 'Self-stropping razor frames from the safety-razor era.',
  },
  {
    label: 'Pull String',
    match: 'Pull String',
    blurb: 'Cord-driven mechanisms sold as pocket sharpeners.',
  },
  {
    label: 'Hones',
    match: 'Hone',
    blurb: 'Natural and synthetic stones that cut a fresh bevel.',
  },
  {
    label: 'Rotary Belt',
    match: 'Rotary Belt',
    blurb: 'Belt-driven wheels turned against the blade.',
  },
  {
    label: 'Magnetic',
    match: 'Magnetic',
    blurb: 'Magnetised guides that hold the blade at a fixed angle.',
  },
  {
    label: 'Electric',
    match: 'Electric',
    blurb: 'Mains-powered sharpeners of the post-war decades.',
  },
];

export const TYPE_IMAGES = {
  Strops:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/361a6cde7_generated_4b310430.png',
  Rollers:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/825bff5f2_generated_5555ab38.png',
  'Auto Strop':
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/aef486215_generated_4bd56326.png',
  'Pull String':
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/45a4b80ad_generated_image.png',
  Hones:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/acfc3aece_generated_e669e569.png',
  'Rotary Belt':
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/e02808993_generated_a0ec6800.png',
  Magnetic:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/aef486215_generated_4bd56326.png',
  Electric:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/e02808993_generated_a0ec6800.png',
};

export const PLACEHOLDER_IMAGE = TYPE_IMAGES.Rollers;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const RARITY_VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T'];

export const RARITY_LABELS = {
  1: 'Common',
  2: 'Fairly common',
  3: 'Uncommon',
  4: 'Scarce',
  5: 'Hard to find',
  6: 'Rare',
  7: 'Very rare',
  8: 'Extremely rare',
  9: 'Unique',
  T: 'Trade / one-off',
};

export const SORT_OPTIONS = [
  { value: 'name', label: 'Name A–Z' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'value', label: 'Value' },
];

export const PAGE_SIZE = 48;

export function typeImage(type) {
  if (!type) return PLACEHOLDER_IMAGE;
  const group = TYPE_GROUPS.find((item) => String(type).startsWith(item.match));
  return group ? TYPE_IMAGES[group.label] : PLACEHOLDER_IMAGE;
}

export function sharpenerImage(sharpener) {
  return sharpener?.images?.[0] || typeImage(sharpener?.type);
}

export function rarityLabel(rarity) {
  return RARITY_LABELS[String(rarity ?? '')] || 'Not rated';
}

export function raritySegments(rarity) {
  if (String(rarity).toUpperCase() === 'T') return 9;
  const n = parseInt(rarity, 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 9) : 0;
}

export function formatValue(value) {
  const n = Number(value);
  if (value !== null && value !== '' && Number.isFinite(n)) {
    return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  return 'Not recorded';
}

export function typeCountryLine(sharpener) {
  return [sharpener?.type, sharpener?.country].filter(Boolean).join(' · ');
}