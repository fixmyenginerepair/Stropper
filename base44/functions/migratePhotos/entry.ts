import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// One-off: copies photos served through jsDelivr (which now refuses this repo
// for being over 50 MB) into the app's own file storage, and repoints records.
// Remove this function once the migration is done.
const KEY = '8c611ddfedc11603c0df0675715e8e94';
const CDN = 'https://cdn.jsdelivr.net/gh/fixmyenginerepair/Stropper@main/';
const RAW = 'https://raw.githubusercontent.com/fixmyenginerepair/Stropper/main/';
const FILES = /^https:\/\/base44\.app\/api\/apps\/[^/]+\/files\/mp\/public\//;

const rowsOf = (r) => (Array.isArray(r) ? r : r?.items || []);

async function copyOne(base44, url) {
  const raw = url.startsWith(CDN) ? RAW + url.slice(CDN.length) : url;
  const res = await fetch(raw);
  if (!res.ok) throw new Error(`${res.status} ${raw}`);
  const blob = await res.blob();
  const name = decodeURIComponent(raw.split('/').pop() || 'photo.jpg').replace(/[^\w.\-]+/g, '_');
  const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
  const out = await base44.asServiceRole.integrations.Core.UploadFile({ file });
  if (!out?.file_url) throw new Error(`no file_url for ${raw}`);
  return out.file_url.replace(FILES, 'https://media.base44.com/images/public/');
}

async function mapUrls(base44, urls, cache, failures) {
  const out = [];
  for (const u of urls) {
    if (typeof u === 'string' && FILES.test(u)) { out.push(u.replace(FILES, 'https://media.base44.com/images/public/')); continue; }
    if (typeof u !== 'string' || !u.includes('cdn.jsdelivr.net')) { out.push(u); continue; }
    if (!cache[u]) {
      try { cache[u] = await copyOne(base44, u); }
      catch (e) { failures.push(String(e.message || e)); out.push(u); continue; }
    }
    out.push(cache[u]);
  }
  return out;
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.key !== KEY) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const base44 = createClientFromRequest(req);
    const entity = body.entity || 'Sharpener';
    const limit = Math.min(Number(body.limit) || 8, 25);
    const exclude = new Set(body.exclude || []);
    const E = base44.asServiceRole.entities[entity];

    if (body.ids) {
      const fixed = [];
      for (const id of body.ids) {
        const row = await E.get(id);
        const failures = [];
        await E.update(id, { images: await mapUrls(base44, row.images || [], {}, failures) });
        fixed.push({ id, failures });
      }
      return Response.json({ fixed });
    }

    const q = entity === 'Article'
      ? { $or: [{ images: { $regex: 'jsdelivr' } }, { cover_image: { $regex: 'jsdelivr' } }, { body: { $regex: 'jsdelivr' } }] }
      : { images: { $regex: 'jsdelivr' } };
    const rows = rowsOf(await E.filter(q, 'name', limit + exclude.size)).filter((r) => !exclude.has(r.id)).slice(0, limit);

    const cache = {};
    const done = [];
    const failed = [];
    for (const row of rows) {
      const failures = [];
      const patch = {};
      if (Array.isArray(row.images)) patch.images = await mapUrls(base44, row.images, cache, failures);
      if (entity === 'Article') {
        if (row.cover_image) patch.cover_image = (await mapUrls(base44, [row.cover_image], cache, failures))[0];
        if (row.body) {
          let text = row.body;
          const found = [...new Set(text.match(/https:\/\/cdn\.jsdelivr\.net\/[^\s)"']+/g) || [])];
          const mapped = await mapUrls(base44, found, cache, failures);
          found.forEach((u, i) => { text = text.split(u).join(mapped[i]); });
          patch.body = text;
        }
      }
      await E.update(row.id, patch);
      (failures.length ? failed : done).push(failures.length ? { id: row.id, name: row.name || row.title, failures } : row.id);
    }
    return Response.json({ entity, processed: rows.length, done: done.length, failed, copied: Object.keys(cache).length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}
