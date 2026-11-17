import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Temporary: receives master copies pulled from the old Site5 server and files them in the
// Classic Stropper register (private storage + size + SHA-256). Delete after use.
const SECRET = '9b2e7d41c6a84f0fa3d5e8c17b46f2a9';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-intake-secret',
};

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export default async function (req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.headers.get('x-intake-secret') !== SECRET) return new Response('forbidden', { status: 403, headers: CORS });
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const meta = JSON.parse(String(form.get('meta') || '{}'));
    const base44 = createClientFromRequest(req);
    const A = base44.asServiceRole.entities.ArchiveItem;
    if (form.get('ping')) return Response.json({ ok: true }, { headers: CORS });
    if (!file) return Response.json({ error: 'no file' }, { status: 400, headers: CORS });

    const buf = await file.arrayBuffer();
    const checksum = hex(await crypto.subtle.digest('SHA-256', buf));
    const { file_uri } = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
      file: new File([buf], file.name, { type: file.type || 'application/octet-stream' }),
    });
    const record = {
      ...(meta.fields || {}),
      file_uri,
      file_name: file.name,
      bytes: buf.byteLength,
      checksum,
      captured_date: new Date().toISOString().slice(0, 10),
    };
    const saved = meta.id ? await A.update(meta.id, record) : await A.create(record);
    return Response.json({ ok: true, id: saved?.id || meta.id, bytes: buf.byteLength, checksum }, { headers: CORS });
  } catch (e) {
    return Response.json({ error: String((e as any)?.message || e) }, { status: 500, headers: CORS });
  }
}
