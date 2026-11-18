// Readable addresses for sharpener pages.
//
//   /sharpener/zowie-automatic-hone-stropper-768
//
// The words come from the piece's name; the number on the end is its ID from
// the original stropper.com (legacy_id), which is unique and never changes, so
// renaming a piece never breaks an old link. Pieces added after the move (no
// legacy ID) end in their Base44 record ID instead. Old /sharpener/<record id>
// links still work and are forwarded to the readable address.

export const SITE_ORIGIN = 'https://stropper.com';

const RECORD_ID = /^[0-9a-f]{24}$/i;

export function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

function sharpenerKey(s) {
  const legacy = s?.legacy_id;
  if (legacy !== null && legacy !== undefined && legacy !== '' && !Number.isNaN(Number(legacy))) {
    return String(Math.round(Number(legacy)));
  }
  return s?.id || '';
}

export function sharpenerSlug(s) {
  const key = sharpenerKey(s);
  const words = slugify(s?.name);
  return words ? `${words}-${key}` : String(key);
}

// Path for links. Records fetched without a name fall back to the record ID,
// which the detail page forwards to the readable address.
export function sharpenerPath(s) {
  if (!s) return '/browse';
  if (!s.name) return `/sharpener/${s.id}`;
  return `/sharpener/${sharpenerSlug(s)}`;
}

export function sharpenerUrl(s) {
  return `${SITE_ORIGIN}${sharpenerPath(s)}`;
}

// Works out which record a /sharpener/<param> address points at.
export function parseSharpenerParam(param) {
  const p = String(param || '').trim();
  if (RECORD_ID.test(p)) return { id: p };
  if (/^\d+$/.test(p)) return { legacyId: Number(p) };
  const last = p.split('-').pop();
  if (RECORD_ID.test(last)) return { id: last };
  if (/^\d+$/.test(last)) return { legacyId: Number(last) };
  return {};
}
