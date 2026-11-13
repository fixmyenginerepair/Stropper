import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Temporary: applies verified patent details to records that are missing them. Delete after use.
const SECRET = 'c7e19a04b2f84d6aa0f3b51e9d27c6f8';
const FIELDS = ['patent_id', 'title', 'inventors', 'assignees', 'drawing_urls', 'verified', 'grant_date', 'year', 'pdf_url', 'notes'];

export default async function (req: Request) {
  if (req.headers.get('x-import-secret') !== SECRET) return new Response('forbidden', { status: 403 });
  const body = await req.json().catch(() => ({}));
  try {
    const base44 = createClientFromRequest(req);
    const P = base44.asServiceRole.entities.Patent;
    const updates: any[] = Array.isArray(body.updates) ? body.updates : [];
    const current: any[] = [];
    for (let skip = 0; ; skip += 500) {
      const chunk = await P.filter({ verified: false, notes: { $regex: '^No online record' } }, 'number', 500, skip, ['id', 'country', 'number']);
      current.push(...(chunk || []));
      if (!chunk || chunk.length < 500) break;
    }
    const byKey = new Map(current.map((c) => [c.country + c.number, c.id]));
    const batch: any[] = [];
    for (const u of updates) {
      const id = byKey.get(u.country + u.number);
      if (!id) continue;
      const rec: any = { id };
      for (const f of FIELDS) rec[f] = u[f] ?? null;
      batch.push(rec);
    }
    for (let i = 0; i < batch.length; i += 100) await P.bulkUpdate(batch.slice(i, i + 100));
    return Response.json({ received: updates.length, pending_before: current.length, updated: batch.length });
  } catch (e) {
    return Response.json({ error: String((e as any)?.message || e) }, { status: 500 });
  }
}
