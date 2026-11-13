import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Temporary: re-checks Patent records that are missing details. Delete after use.
const SECRET = 'f621b234751d5053d9bba8faae302183';

const KIND: Record<string, string[]> = { US: ['A', 'S', ''], GB: ['A', ''], DE: ['C', ''], FR: ['A', ''], CA: ['A', ''], CH: ['A', ''], AT: ['B', ''], IT: [''], SE: ['C', ''], AU: ['A', ''] };
const KW = /razor|strop|blade|sharpen|hone|honing|shav|grind|whet|cutler|knife|knive|barber|lather|brush|soap|edge|cutting|toilet|clipper|scissor|strap|hair|beard|abzieh|rasier|schleif|klinge|rasoir|lame|affût|affil/i;

type Raw = { country: string; number: string; dates: string[]; ids: string[] };

const unesc = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const yearOf = (d: string) => {
  const m = /(\d{2,4})\s*$/.exec(d || '');
  if (!m) return null;
  return m[1].length === 2 ? '19' + m[1] : m[1];
};

async function lookup(p: Raw) {
  for (const k of KIND[p.country] || ['']) {
    const pid = `${p.country}${p.number}${k}`;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`https://patents.google.com/patent/${pid}/en`, { headers: { 'User-Agent': 'Mozilla/5.0 (archival research; stropper.com)' } });
        if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 1500 * (attempt + 1))); continue; }
        if (!res.ok) break;
        const page = await res.text();
        const title = unesc((/<meta name="DC.title" content="([^"]*)"/.exec(page) || [])[1] || '').trim();
        const inventors = [...page.matchAll(/<meta name="DC.contributor" content="([^"]*)" scheme="inventor"/g)].map((m) => unesc(m[1]));
        const assignees = [...page.matchAll(/<meta name="DC.contributor" content="([^"]*)" scheme="assignee"/g)].map((m) => unesc(m[1]));
        const date = ((/<meta name="DC.date" content="([^"]*)" scheme="issue"/.exec(page) || /<meta name="DC.date" content="([^"]*)"/.exec(page)) || [])[1] || '';
        const images = [...page.matchAll(/itemprop="full" content="(https:\/\/patentimages[^"]+\.png)"/g)].map((m) => m[1]).slice(0, 4);
        const pdf = (/<meta name="citation_pdf_url" content="([^"]+)"/.exec(page) || [])[1] || '';
        return { pid, title, inventors, assignees, date, images, pdf };
      } catch (_) { await new Promise((r) => setTimeout(r, 1000)); }
    }
  }
  return null;
}

function build(p: Raw, g: any) {
  const rec: any = {};
  const recYears = new Set(p.dates.map(yearOf).filter(Boolean));
  const gy = g.date.slice(0, 4);
  const relevant = KW.test(g.title || '');
  const yearOk = !recYears.size || recYears.has(gy);
  if (relevant || (yearOk && recYears.size) || !g.title) {
    Object.assign(rec, {
      patent_id: g.pid,
      title: (g.title || '').replace(/\.$/, '').trim(),
      inventors: g.inventors.map((x: string) => (x === x.toUpperCase() ? x.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : x)),
      assignees: g.assignees,
      drawing_urls: g.images,
      verified: true,
      notes: null,
    });
    if (/^\d{4}-\d{2}-\d{2}/.test(g.date)) { rec.grant_date = g.date.slice(0, 10); rec.year = Number(gy); }
    if (g.pdf) rec.pdf_url = g.pdf;
    if (recYears.size && !yearOk) rec.notes = `The date recorded on the piece (${p.dates.join(', ')}) differs from the patent's issue date (${g.date}). It may refer to a related filing, a re-issue or a design registration.`;
  } else {
    rec.verified = false;
    rec.notes = `The number as recorded (${p.country} ${p.number}) matches an unrelated patent online ("${(g.title || '').slice(0, 80)}"), so it is probably a transcription error. Check the marking on the piece.`;
  }
  return rec;
}

export default async function (req: Request) {
  if (req.headers.get('x-import-secret') !== SECRET) return new Response('forbidden', { status: 403 });
  const body = await req.json().catch(() => ({}));
  try {
    const base44 = createClientFromRequest(req);
    const P = base44.asServiceRole.entities.Patent;
    const q = { verified: false, notes: { $regex: '^No online record' } };
    const todo = await P.filter(q, 'number', Number(body.limit ?? 15), Number(body.skip ?? 0));
    let fixed = 0;
    const missed: string[] = [];
    for (const t of todo || []) {
      const raw: Raw = { country: t.country, number: t.number, dates: t.dates_on_items || [], ids: t.sharpener_ids || [] };
      const g = await lookup(raw);
      await new Promise((r) => setTimeout(r, 300));
      if (!g) { missed.push(t.country + t.number); continue; }
      await P.update(t.id, build(raw, g));
      fixed += 1;
    }
    const left = await P.count(q);
    return Response.json({ checked: (todo || []).length, fixed, missed, left });
  } catch (e) {
    return Response.json({ error: String((e as any)?.message || e) }, { status: 500 });
  }
}
