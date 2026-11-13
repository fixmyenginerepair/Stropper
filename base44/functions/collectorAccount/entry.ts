import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const EDITABLE = [
  'name',
  'country',
  'collection_type',
  'main_collection_size',
  'sharpener_collection_size',
  'email',
];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Finds the collector record that belongs to the signed-in user: linked by
// user_id first, otherwise claimed through an exact e-mail match.
async function resolveCollector(base44, user) {
  const rows = await base44.asServiceRole.entities.Collector.list('name', 1000);
  const list = Array.isArray(rows) ? rows : rows?.items || [];

  const linked = list.find((row) => row.user_id && row.user_id === user.id);
  if (linked) return linked;

  const email = String(user.email || '').trim().toLowerCase();
  if (!email) return null;

  const claimable = list.find(
    (row) => !row.user_id && String(row.email || '').trim().toLowerCase() === email
  );
  if (!claimable) return null;

  await base44.asServiceRole.entities.Collector.update(claimable.id, { user_id: user.id });
  return { ...claimable, user_id: user.id };
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const action = body?.action === 'save' ? 'save' : 'load';
    const profile = await resolveCollector(base44, user);

    if (action === 'save') {
      const input = body?.profile || {};
      const name = String(input.name || '').trim();
      if (!name) return Response.json({ error: 'A name is required' }, { status: 400 });

      const payload = { name };
      for (const key of EDITABLE) {
        if (key === 'name') continue;
        if (input[key] !== undefined) payload[key] = String(input[key] ?? '').trim();
      }

      const saved = profile
        ? await base44.asServiceRole.entities.Collector.update(profile.id, payload)
        : await base44.asServiceRole.entities.Collector.create({
            ...payload,
            user_id: user.id,
            approved: false,
          });

      return Response.json({ profile: saved });
    }

    if (!profile || !String(profile.name || '').trim()) {
      return Response.json({ profile: profile || null, pieces: [], total: 0 });
    }

    const query = {
      collection: { $regex: `^${escapeRegex(profile.name.trim())}$`, $options: 'i' },
    };
    const [count, page] = await Promise.all([
      base44.asServiceRole.entities.Sharpener.count(query),
      base44.asServiceRole.entities.Sharpener.filter(query, { sort: 'name', limit: 200 }),
    ]);

    return Response.json({
      profile,
      total: count || 0,
      pieces: page?.items || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}