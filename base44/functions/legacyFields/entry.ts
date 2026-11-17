import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Temporary: copies fields that were never migrated from the old stropper.com database
// onto Sharpener records, matched by legacy_id. Delete after use.
const SECRET = '4e8a1c93d7b25f60a1e9c4d8b7f3a2e5';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-intake-secret',
};
const FIELDS = ['added_date', 'has_box', 'has_instructions', 'cost1', 'cost2', 'cost3', 'lister_id', 'editors_note'];

export default async function (req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.headers.get('x-intake-secret') !== SECRET) return new Response('forbidden', { status: 403, headers: CORS });
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const S = base44.asServiceRole.entities.Sharpener;
    const all: any[] = [];
    for (let skip = 0; ; skip += 500) {
      const chunk = await S.filter({}, 'legacy_id', 500, skip, ['id', 'legacy_id']);
      all.push(...(chunk || []));
      if (!chunk || chunk.length < 500) break;
    }
    const byLegacy = new Map(all.map((r) => [Number(r.legacy_id), r.id]));
    const batch: any[] = [];
    const missing: number[] = [];
    for (const u of body.updates || []) {
      const id = byLegacy.get(Number(u.legacy_id));
      if (!id) { missing.push(u.legacy_id); continue; }
      const rec: any = { id };
      for (const f of FIELDS) if (u[f] !== undefined) rec[f] = u[f];
      batch.push(rec);
    }
    for (let i = 0; i < batch.length; i += 100) await S.bulkUpdate(batch.slice(i, i + 100));
    return Response.json({ received: (body.updates || []).length, updated: batch.length, missing }, { headers: CORS });
  } catch (e) {
    return Response.json({ error: String((e as any)?.message || e) }, { status: 500, headers: CORS });
  }
}
