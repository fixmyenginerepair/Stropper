// The decades of the razor-sharpener story, used by the home-page timeline and
// by each piece's "Its place in history" panel. A piece is dated by the
// earliest patent it carries (or its own year, when one is recorded).

import { base44 } from '@/api/base44Client';

export const ERAS = [
  {
    decade: 1880,
    name: 'The Barber’s Strop',
    line: 'Straight razors rule, and every edge is kept on leather and stone.',
    story:
      'Shaving still means an open blade. Strops and hones hang in every barber shop, and inventors start patenting gadgets to keep a keen edge at home.',
  },
  {
    decade: 1890,
    name: 'The Mail-Order Age',
    line: 'Catalogues carry clever stropping machines to every small town.',
    story:
      'Mail-order catalogues and hardware wholesalers put patented strops and stroppers within reach of anyone. The first safety razors appear beside them.',
  },
  {
    decade: 1900,
    name: 'The Safety Razor Arrives',
    line: 'Thin, replaceable blades change shaving — and invent a new problem.',
    story:
      'Thin, stamped safety-razor blades go on sale. They are cheap, but not cheap enough to throw away after a few shaves, and a new trade is born: making a blade last.',
  },
  {
    decade: 1910,
    name: 'War and the Daily Shave',
    line: 'Millions of men learn to shave with a safety razor.',
    story:
      'The First World War puts safety razors in soldiers’ kits by the million. Back home, compact stroppers and blade sharpeners become everyday household tools.',
  },
  {
    decade: 1920,
    name: 'The Golden Age of the Sharpener',
    line: 'More sharpener patents than any other decade in the archive.',
    story:
      'Roller stroppers, pull-string machines, self-stropping razors and boxed hone-and-strop sets compete in every magazine. More pieces in this archive carry a 1920s patent than any other decade.',
  },
  {
    decade: 1930,
    name: 'Depression Thrift',
    line: 'A blade that lasts a month is money saved.',
    story:
      'Hard times keep sharpeners selling: getting thirty shaves from one blade matters when every cent counts. Electric shavers make their first appearance.',
  },
  {
    decade: 1940,
    name: 'Wartime Shortages',
    line: 'Metal is rationed and the field grows thin.',
    story:
      'War work claims the factories and the metal. Fewer new sharpeners reach the shops, and the ones that do are simpler.',
  },
  {
    decade: 1950,
    name: 'The Edge Fades',
    line: 'Better, cheaper blades make resharpening a hobby.',
    story:
      'Stainless and coated blades last longer and cost less. The sharpener slips from the bathroom shelf into the collector’s cabinet.',
  },
];

export function eraFor(year) {
  const y = Number(year);
  if (!y) return null;
  const decade = Math.floor(y / 10) * 10;
  return ERAS.find((e) => e.decade === decade) || { decade, name: `The ${decade}s`, line: '', story: '' };
}

export function patentYear(p) {
  return Number(p?.year) || Number(String(p?.grant_date || '').slice(0, 4)) || null;
}

// Every patent, light fields only, fetched once per visit.
let patentsPromise;
export function loadPatents() {
  if (!patentsPromise) {
    patentsPromise = base44.entities.Patent.list('year', 1000, 0, [
      'id',
      'number',
      'country',
      'year',
      'grant_date',
      'title',
      'drawing_urls',
      'sharpener_ids',
      'maker_id',
      'inventors',
    ]).catch(() => {
      patentsPromise = null;
      return [];
    });
  }
  return patentsPromise;
}

let adsPromise;
export function loadAds() {
  if (!adsPromise) {
    adsPromise = base44.entities.PeriodAd.list('year', 200).catch(() => {
      adsPromise = null;
      return [];
    });
  }
  return adsPromise;
}

export const SHARPENER_CARD_FIELDS = ['id', 'name', 'legacy_id', 'type', 'country', 'images', 'rarity', 'maker_id'];
