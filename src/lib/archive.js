export const SHARPENER_TYPES = [
  'Strops',
  'Rollers',
  'Auto Strop',
  'Pull String',
  'Hones',
  'Rotary Belt',
  'Magnetic',
  'Electric',
];

export const TYPE_BLURBS = {
  Strops: 'Leather, canvas and linen strops that realign a blade’s edge.',
  Rollers: 'Clamp-and-roll devices that brought the edge back to life.',
  'Auto Strop': 'Self-stropping razor frames from the safety-razor era.',
  'Pull String': 'Cord-driven mechanisms sold as pocket sharpeners.',
  Hones: 'Natural and synthetic stones that cut a fresh bevel.',
  'Rotary Belt': 'Belt-driven wheels turned against the blade.',
  Magnetic: 'Magnetised guides that hold the blade at a fixed angle.',
  Electric: 'Mains-powered sharpeners of the post-war decades.',
};

export const TYPE_IMAGES = {
  Strops:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/361a6cde7_generated_4b310430.png',
  Rollers:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/825bff5f2_generated_5555ab38.png',
  'Auto Strop':
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/aef486215_generated_4bd56326.png',
  'Pull String':
    'https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png',
  Hones:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/acfc3aece_generated_e669e569.png',
  'Rotary Belt':
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/e02808993_generated_a0ec6800.png',
  Magnetic:
    'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/825bff5f2_generated_5555ab38.png',
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

export function sharpenerImage(sharpener) {
  return sharpener?.images?.[0] || TYPE_IMAGES[sharpener?.type] || PLACEHOLDER_IMAGE;
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
  if (value === 0 || value) {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
  }
  return 'Not recorded';
}

export function typeCountryLine(sharpener) {
  return [sharpener?.type, sharpener?.country].filter(Boolean).join(' · ');
}