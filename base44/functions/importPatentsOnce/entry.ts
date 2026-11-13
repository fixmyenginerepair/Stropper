import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import data from './data.json' with { type: 'json' };

// Temporary one-off importer for the Patent table. Delete after use.
const SECRET = '00be90257c38f69e1c8d3aabf6666553';

export default async function (req) {
  if (req.headers.get('x-import-secret') !== SECRET) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const base44 = createClientFromRequest(req);
  const P = base44.asServiceRole.entities.Patent;
  const existing = await P.list('number', 1);
  const have = Array.isArray(existing) ? existing.length : (existing?.items || []).length;
  if (have > 0) return Response.json({ error: 'Patent table is not empty; refusing to import twice.' }, { status: 409 });
  let created = 0;
  for (let i = 0; i < data.length; i += 100) {
    const batch = data.slice(i, i + 100);
    await P.bulkCreate(batch);
    created += batch.length;
  }
  return Response.json({ created });
}
