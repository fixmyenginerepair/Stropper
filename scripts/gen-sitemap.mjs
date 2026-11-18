// Builds public/sitemap.xml with every public page and record on stropper.com.
// Run with: npm run sitemap   (then publish the app)
import { writeFileSync } from 'node:fs';

const APP = '6aef7ea3490a3928d32a4982';
const API = `https://stroppercom-d32a4982.base44.app/api/apps/${APP}/entities`;
const SITE = 'https://stropper.com';

const STATIC = [
  ['/', '1.0', 'weekly'],
  ['/browse', '0.9', 'weekly'],
  ['/list', '0.8', 'weekly'],
  ['/identify', '0.9', 'monthly'],
  ['/most-wanted', '0.8', 'weekly'],
  ['/how-it-works', '0.8', 'monthly'],
  ['/history', '0.8', 'monthly'],
  ['/map', '0.7', 'monthly'],
  ['/patents', '0.8', 'monthly'],
  ['/advertising', '0.7', 'monthly'],
  ['/collectors', '0.6', 'monthly'],
  ['/about', '0.6', 'yearly'],
  ['/classic', '0.5', 'yearly'],
];

async function all(entity, fields) {
  const rows = [];
  for (let skip = 0; ; skip += 500) {
    const res = await fetch(`${API}/${entity}?limit=500&skip=${skip}&sort=created_date&fields=${fields}`);
    if (!res.ok) throw new Error(`${entity}: HTTP ${res.status}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 500) break;
  }
  return rows;
}

const day = (d) => (d ? String(d).slice(0, 10) : undefined);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const urls = STATIC.map(([path, priority, changefreq]) => ({ loc: SITE + path, priority, changefreq }));

const [sharpeners, makers, patents, articles, collectors] = await Promise.all([
  all('Sharpener', 'id,updated_date'),
  all('Maker', 'id,updated_date'),
  all('Patent', 'id,updated_date'),
  all('Article', 'id,slug,status,updated_date'),
  all('Collector', 'id,approved,updated_date'),
]);

for (const r of makers) urls.push({ loc: `${SITE}/makers/${r.id}`, lastmod: day(r.updated_date), priority: '0.7' });
for (const r of articles.filter((a) => a.status === 'Published')) {
  urls.push({ loc: `${SITE}/history/${encodeURIComponent(r.slug || r.id)}`, lastmod: day(r.updated_date), priority: '0.7' });
}
for (const r of sharpeners) urls.push({ loc: `${SITE}/sharpener/${r.id}`, lastmod: day(r.updated_date), priority: '0.6' });
for (const r of patents) urls.push({ loc: `${SITE}/patents/${r.id}`, lastmod: day(r.updated_date), priority: '0.5' });
for (const r of collectors.filter((c) => c.approved)) {
  urls.push({ loc: `${SITE}/collectors/${r.id}`, lastmod: day(r.updated_date), priority: '0.3' });
}

const body = urls.map((u) => [
  '  <url>',
  `    <loc>${esc(u.loc)}</loc>`,
  u.lastmod && `    <lastmod>${u.lastmod}</lastmod>`,
  u.changefreq && `    <changefreq>${u.changefreq}</changefreq>`,
  u.priority && `    <priority>${u.priority}</priority>`,
  '  </url>',
].filter(Boolean).join('\n')).join('\n');

writeFileSync(
  new URL('../public/sitemap.xml', import.meta.url),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
);
console.log(`sitemap.xml: ${urls.length} URLs (${sharpeners.length} sharpeners, ${makers.length} makers, ${patents.length} patents, ${articles.filter((a) => a.status === 'Published').length} articles, ${collectors.filter((c) => c.approved).length} collectors)`);
