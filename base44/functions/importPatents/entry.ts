import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// One-off importer: builds the Patent table from the patent numbers recorded on Sharpener records.
// Protected by a secret header; delete this function after the import.
const SECRET = '2074506e08b6404326a868179da80f94';

const CC: [string, string][] = [
  ['GERMANY DRP', 'DE'], ['GERMANY', 'DE'], ['GER', 'DE'], ['DRP', 'DE'], ['ENGLAND', 'GB'], ['ENG', 'GB'], ['UK', 'GB'],
  ['FRANCE', 'FR'], ['FR', 'FR'], ['CANADA', 'CA'], ['CAN', 'CA'], ['SWITZ', 'CH'], ['AUSTRIA', 'AT'], ['AUSTRALIA', 'AU'],
  ['ITALY', 'IT'], ['SWEDEN', 'SE'], ['US', 'US'],
];
const CCMAP = Object.fromEntries(CC);
const ccRe = new RegExp('\\b(' + CC.map(([k]) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b\\.?\\s*-', 'gi');
const numRe = /(?<![\d/,])(\d{1,3}(?:,\d{3})+|\d{5,9})(?![\d/,])(?:\s*\(([^)]*)\))?/g;
const KIND: Record<string, string[]> = { US: ['A', 'S', ''], GB: ['A', ''], DE: ['C', ''], FR: ['A', ''], CA: ['A', ''], CH: ['A', ''], AT: ['B', ''], IT: [''], SE: ['C', ''], AU: ['A', ''] };
const KW = /razor|strop|blade|sharpen|hone|honing|shav|grind|whet|cutler|knife|knive|barber|lather|brush|soap|edge|cutting|toilet|clipper|scissor|strap|hair|beard|abzieh|rasier|schleif|klinge|rasoir|lame|affût|affil/i;

type Raw = { country: string; number: string; dates: string[]; ids: string[] };

function parseAll(rows: any[]): Raw[] {
  const map = new Map<string, Raw>();
  for (const r of rows) {
    let s: string = r.patent || '';
    s = s.replace(/Latham\s+patent\s+/gi, ' Eng - ');
    const marks = [...s.matchAll(ccRe)];
    marks.forEach((m, i) => {
      const seg = s.slice(m.index! + m[0].length, i + 1 < marks.length ? marks[i + 1].index : s.length);
      const cc = CCMAP[m[1].toUpperCase()];
      for (const n of seg.matchAll(numRe)) {
        const num = n[1].replace(/,/g, '');
        const key = cc + num;
        if (!map.has(key)) map.set(key, { country: cc, number: num, dates: [], ids: [] });
        const p = map.get(key)!;
        if (n[2] && !p.dates.includes(n[2].trim())) p.dates.push(n[2].trim());
        if (!p.ids.includes(r.id)) p.ids.push(r.id);
      }
    });
  }
  return [...map.values()].sort((a, b) => (a.country + a.number.padStart(10, '0')).localeCompare(b.country + b.number.padStart(10, '0')));
}

const unesc = (s: string) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const yearOf = (d: string) => {
  const m = /(\d{2,4})\s*$/.exec(d || '');
  if (!m) return null;
  return m[1].length === 2 ? '19' + m[1] : m[1];
};

async function lookup(p: Raw) {
  for (const k of KIND[p.country] || ['']) {
    const pid = `${p.country}${p.number}${k}`;
    try {
      const res = await fetch(`https://patents.google.com/patent/${pid}/en`, { headers: { 'User-Agent': 'Mozilla/5.0 (archival research; stropper.com)' } });
      if (!res.ok) continue;
      const page = await res.text();
      const title = unesc((/<meta name="DC.title" content="([^"]*)"/.exec(page) || [])[1] || '').trim();
      const inventors = [...page.matchAll(/<meta name="DC.contributor" content="([^"]*)" scheme="inventor"/g)].map((m) => unesc(m[1]));
      const assignees = [...page.matchAll(/<meta name="DC.contributor" content="([^"]*)" scheme="assignee"/g)].map((m) => unesc(m[1]));
      const date = ((/<meta name="DC.date" content="([^"]*)" scheme="issue"/.exec(page) || /<meta name="DC.date" content="([^"]*)"/.exec(page)) || [])[1] || '';
      const images = [...page.matchAll(/itemprop="full" content="(https:\/\/patentimages[^"]+\.png)"/g)].map((m) => m[1]).slice(0, 4);
      const pdf = (/<meta name="citation_pdf_url" content="([^"]+)"/.exec(page) || [])[1] || '';
      return { pid, title, inventors, assignees, date, images, pdf };
    } catch (_) { /* try next kind */ }
  }
  return null;
}

function build(p: Raw, g: any, makerOf: Map<string, string>) {
  const makers = new Set(p.ids.map((id) => makerOf.get(id)).filter(Boolean));
  const rec: any = { country: p.country, number: p.number, dates_on_items: p.dates, sharpener_ids: p.ids };
  if (makers.size === 1) rec.maker_id = [...makers][0];
  const recYears = new Set(p.dates.map(yearOf).filter(Boolean));
  if (g) {
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
      });
      if (/^\d{4}-\d{2}-\d{2}/.test(g.date)) { rec.grant_date = g.date.slice(0, 10); rec.year = Number(gy); }
      if (g.pdf) rec.pdf_url = g.pdf;
      if (recYears.size && !yearOk) rec.notes = `The date recorded on the piece (${p.dates.join(', ')}) differs from the patent's issue date (${g.date}). It may refer to a related filing, a re-issue or a design registration.`;
    } else {
      rec.verified = false;
      rec.notes = `The number as recorded (${p.country} ${p.number}) matches an unrelated patent online ("${(g.title || '').slice(0, 80)}"), so it is probably a transcription error. Check the marking on the piece.`;
    }
  } else {
    rec.verified = false;
    rec.notes = 'No online record found for this number yet. It may need a kind code or a different numbering format (older British patents are numbered by year).';
  }
  if (!rec.year) { const y = p.dates.map(yearOf).find(Boolean); if (y) rec.year = Number(y); }
  return rec;
}

export default async function (req: Request) {
  if (req.headers.get('x-import-secret') !== SECRET) return Response.json({ error: 'Forbidden' }, { status: 403 });
  const url = new URL(req.url);
  const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
  const start = Number(body.start ?? url.searchParams.get('start') ?? 0);
  const count = Number(body.count ?? url.searchParams.get('count') ?? 60);

  const base44 = createClientFromRequest(req);
  const S = base44.asServiceRole.entities.Sharpener;
  const P = base44.asServiceRole.entities.Patent;

  const rows: any[] = [];
  for (let skip = 0; ; skip += 500) {
    const chunk = await S.filter({ patent: { $nin: [null, ''] } }, 'legacy_id', 500, skip, ['id', 'patent', 'maker_id']);
    rows.push(...(chunk || []));
    if (!chunk || chunk.length < 500) break;
  }
  const makerOf = new Map(rows.filter((r) => r.maker_id).map((r) => [r.id, r.maker_id]));
  const all = parseAll(rows);
  const slice = all.slice(start, start + count);

  const existing = await P.filter({ $or: slice.map((p) => ({ country: p.country, number: p.number })) }, 'number', 500, 0, ['country', 'number']).catch(() => []);
  const have = new Set((existing || []).map((e: any) => e.country + e.number));
  const todo = slice.filter((p) => !have.has(p.country + p.number));

  const out: any[] = [];
  for (let i = 0; i < todo.length; i += 6) {
    const group = todo.slice(i, i + 6);
    const found = await Promise.all(group.map(lookup));
    group.forEach((p, j) => out.push(build(p, found[j], makerOf)));
  }
  if (out.length) await P.bulkCreate(out);
  return Response.json({ total: all.length, start, count, created: out.length, skipped: slice.length - todo.length, verified: out.filter((r) => r.verified).length, next: start + count < all.length ? start + count : null });
}
