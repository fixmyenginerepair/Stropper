import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { cached } from '@/lib/limited';

// The founder's own pieces are catalogued under this collector ID.
export const FOUNDER_COLLECTION = 'twillard';

// A blank "copies" field counts as one piece.
export const copiesOf = (r) => {
  const n = Number(r?.copies);
  return r?.copies === null || r?.copies === undefined || r?.copies === '' || !Number.isFinite(n) ? 1 : n;
};

// Reads every record and adds up the copies field.
// pieces = different sharpeners owned (count 1+); total = sum of the count field (old site's mycount).
export function fetchCollectionCounts(collection = FOUNDER_COLLECTION) {
  return cached(`counts:${collection || 'all'}`, async () => {
    const query = collection ? { collection } : {};
    let pieces = 0;
    let total = 0;
    let cursor;
    do {
      const page = await base44.entities.Sharpener.filter(query, { sort: 'name', limit: 200, ...(cursor ? { cursor } : {}) });
      (page.items || []).forEach((r) => { const n = copiesOf(r); if (n > 0) pieces += 1; total += n; });
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
    return { pieces, total };
  }, 5 * 60 * 1000);
}

export function useCollectionCounts(collection = FOUNDER_COLLECTION) {
  const [counts, setCounts] = useState(null);
  useEffect(() => {
    let alive = true;
    fetchCollectionCounts(collection).then((c) => alive && setCounts(c)).catch(() => {});
    return () => { alive = false; };
  }, [collection]);
  return counts;
}
