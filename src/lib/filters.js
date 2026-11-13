import { base44 } from '@/api/base44Client';
import { PAGE_SIZE, rarityBandValues } from '@/lib/archive';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Makers whose own name or any of their aliases matches the search word, so a
// piece filed under "AutoStrop" is also found by "Valet Auto Strop".
export async function makerIdsFor(term) {
  if (!term) return [];
  const match = { $regex: escapeRegex(term), $options: 'i' };
  const rows = await base44.entities.Maker
    .filter({ $or: [{ name: match }, { aliases: match }] }, 'name', 200, 0)
    .catch(() => []);
  return (rows || []).map((row) => row.id);
}

// Browse and The Book both search with this, so alias matching is identical in each.
export async function buildSearchQuery(filters) {
  const makerIds = await makerIdsFor(filters.q);
  return buildQuery(filters, makerIds);
}

export const SORT_PARAMS = {
  name: 'name',
  updated: '-updated_date',
  rarity: '-rarity',
  value: '-value',
};

export function readFilters(params) {
  return {
    q: params.get('q') || '',
    letter: params.get('letter') || '',
    country: params.get('country') || '',
    type: params.get('type') || '',
    rarity: params.get('rarity') || '',
    collector: params.get('collector') || '',
    updated: params.get('updated') || '',
    sort: params.get('sort') || 'name',
    page: Number(params.get('page') || 1) || 1,
  };
}

// Keeps every active filter as a query string, so Browse and The Book
// can be linked to each other without losing the search.
export function filtersToParams(filters) {
  const params = new URLSearchParams();
  ['q', 'letter', 'country', 'type', 'rarity', 'collector', 'updated', 'sort'].forEach((key) => {
    if (filters[key] && !(key === 'sort' && filters[key] === 'name')) {
      params.set(key, filters[key]);
    }
  });
  return params;
}

export function buildQuery(filters, makerIds = []) {
  const query = {};

  if (filters.q) {
    query.$or = [
      { name: { $regex: filters.q, $options: 'i' } },
      { manufacturer: { $regex: filters.q, $options: 'i' } },
      { patent: { $regex: filters.q, $options: 'i' } },
      { comment: { $regex: filters.q, $options: 'i' } },
      { collection: { $regex: filters.q, $options: 'i' } },
    ];
  }
  if (makerIds.length) {
    // Pieces made by a maker whose alias matched the search word.
    query.$or = [...(query.$or || []), { maker_id: { $in: makerIds } }];
  }
  if (filters.letter) {
    query.name = { $regex: `^${filters.letter}`, $options: 'i' };
  }
  if (filters.country) query.country = filters.country;
  // Prefix match so the home page families (Rollers, Hone …) find
  // Rollers-1 … Rollers-4 and Hone-Carborundum.
  if (filters.type) query.type = { $regex: `^${filters.type}`, $options: 'i' };
  if (filters.rarity) {
    // A rarity band (common, rare, unique) covers several ratings at once.
    const band = rarityBandValues(filters.rarity);
    query.rarity = band ? { $in: band } : filters.rarity;
  }
  if (filters.collector) {
    query.collection = { $regex: `^${filters.collector}`, $options: 'i' };
  }
  if (filters.updated) {
    const since = new Date();
    since.setDate(since.getDate() - Number(filters.updated));
    query.updated_date = { $gte: since.toISOString() };
  }

  return query;
}

export async function fetchResultPage(entity, query, sort, page) {
  let cursor;
  let items = [];

  for (let current = 1; current <= page; current += 1) {
    const result = await entity.filter(query, {
      sort: SORT_PARAMS[sort] || 'name',
      limit: PAGE_SIZE,
      ...(cursor ? { cursor } : {}),
    });

    if (current === page) items = result.items || [];
    if (!result.has_more) break;
    cursor = result.next_cursor;
  }

  return items;
}

export function isFiltered(filters) {
  return Boolean(
    filters.q ||
      filters.letter ||
      filters.country ||
      filters.type ||
      filters.rarity ||
      filters.collector ||
      filters.updated
  );
}