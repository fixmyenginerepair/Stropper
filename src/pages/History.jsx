import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const years = (m) => [m.founded_year, m.closed_year].filter(Boolean).join(' – ') || '';

export default function History() {
  const [articles, setArticles] = useState(null);
  const [makers, setMakers] = useState(null);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    base44.entities.Article.filter({ status: 'Published' }, '-featured', 100)
      .then((rows) => setArticles(rows || []))
      .catch(() => setArticles([]));
    base44.entities.Maker.list('name', 200)
      .then(async (rows) => {
        setMakers(rows || []);
        const pairs = await Promise.all(
          (rows || []).map((m) => base44.entities.Sharpener.count({ maker_id: m.id }).then((n) => [m.id, n]).catch(() => [m.id, 0]))
        );
        setCounts(Object.fromEntries(pairs));
      })
      .catch(() => setMakers([]));
  }, []);

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">History</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">The makers and their stories</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-steel">
          Who made these sharpeners, where, and why. Each history is built from patents, period
          advertising, museum records and the markings on the pieces in this archive.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="eyebrow text-steel">Articles</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles === null &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[10px] border border-hair bg-white">
                <div className="aspect-[16/9] animate-pulse bg-frost" />
                <div className="space-y-2 p-5"><div className="h-4 w-3/4 animate-pulse rounded bg-frost" /><div className="h-3 w-full animate-pulse rounded bg-frost" /></div>
              </div>
            ))}
          {articles?.map((a) => (
            <Link key={a.id} to={`/history/${a.slug || a.id}`} className="group overflow-hidden rounded-[10px] border border-hair bg-white transition-colors hover:border-oxblood">
              <div className="aspect-[16/9] overflow-hidden bg-navy">
                {a.cover_image && <img src={a.cover_image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
              </div>
              <div className="p-5">
                <p className="eyebrow text-oxblood">{a.category}</p>
                <h3 className="mt-2 font-heading text-[19px] font-bold leading-snug text-ink group-hover:text-oxblood">{a.title}</h3>
                {a.summary && <p className="mt-2 text-[14px] leading-relaxed text-steel">{a.summary}</p>}
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-oxblood">Read the history <ArrowRight className="h-3.5 w-3.5" /></span>
              </div>
            </Link>
          ))}
          {articles?.length === 0 && <p className="text-steel">No articles have been published yet.</p>}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="eyebrow text-steel">Makers</h2>
        <div className="mt-4 overflow-hidden rounded-[10px] border border-hair bg-white">
          {makers?.map((m) => (
            <Link key={m.id} to={`/makers/${m.id}`} className="flex items-center gap-4 border-b border-hair px-4 py-3 last:border-0 hover:bg-frost/60">
              <span className="h-12 w-20 shrink-0 overflow-hidden rounded bg-navy">
                {m.images?.[0] && <img src={m.images[0]} alt="" className="h-full w-full object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[16px] font-bold text-ink">{m.name}</span>
                <span className="block truncate text-[13px] text-steel">{[m.city, m.country].filter(Boolean).join(', ')}{years(m) && ` · ${years(m)}`}</span>
              </span>
              <span className="hidden shrink-0 text-[13px] text-steel sm:block">
                {counts[m.id] ? `${counts[m.id]} in the archive` : ''}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-steel" />
            </Link>
          ))}
          {makers === null && <p className="px-4 py-6 text-steel">Loading…</p>}
        </div>
      </section>
    </div>
  );
}
