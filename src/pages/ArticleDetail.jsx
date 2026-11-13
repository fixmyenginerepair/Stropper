import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Markdown, { SourceList } from '@/components/history/Markdown';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [makers, setMakers] = useState([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setArticle(null);
    setMissing(false);
    base44.entities.Article.filter({ slug }, null, 1)
      .then(async (rows) => {
        let record = rows?.[0];
        if (!record && /^[a-f0-9]{24}$/i.test(slug)) record = await base44.entities.Article.get(slug).catch(() => null);
        if (cancelled) return;
        if (!record) { setMissing(true); return; }
        setArticle(record);
        document.title = `${record.title} · Stropper.com`;
        if (record.maker_ids?.length) {
          const found = await base44.entities.Maker.filter({ id: { $in: record.maker_ids } }, 'name', 20).catch(() => []);
          if (!cancelled) setMakers(found || []);
        }
      })
      .catch(() => !cancelled && setMissing(true));
    return () => { cancelled = true; };
  }, [slug]);

  if (missing) {
    return (
      <div className="archive-container py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">This article isn’t available</h1>
        <Link to="/history" className="mt-4 inline-block text-sm font-semibold text-oxblood">Back to History</Link>
      </div>
    );
  }

  if (!article) {
    return <div className="archive-container py-24"><div className="h-6 w-64 animate-pulse rounded bg-white" /></div>;
  }

  const span = [article.era_start_year, article.era_end_year].filter(Boolean).join(' – ');

  return (
    <article className="pb-16">
      {article.cover_image && (
        <div className="bg-navy">
          <img src={article.cover_image} alt="" className="mx-auto block max-h-[460px] w-full max-w-6xl object-cover" />
        </div>
      )}
      <div className="archive-container">
        <div className="mx-auto max-w-[720px] pt-10">
          <nav className="flex items-center gap-2 text-[13px] text-steel">
            <Link to="/history" className="flex items-center gap-1 hover:text-oxblood"><ArrowLeft className="h-3.5 w-3.5" /> History</Link>
          </nav>
          <p className="eyebrow mt-6 text-oxblood">{[article.category, span].filter(Boolean).join(' · ')}</p>
          <h1 className="mt-3 font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.6rem]">{article.title}</h1>
          {article.summary && <p className="mt-4 text-[18px] leading-relaxed text-steel">{article.summary}</p>}
          <p className="mt-5 text-[13px] text-steel">
            {article.author}
            {article.published_date && ` · ${new Date(`${article.published_date}T12:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`}
          </p>

          <div className="mt-6 border-t border-hair pt-2">
            <Markdown>{article.body}</Markdown>
          </div>

          {makers.length > 0 && (
            <div className="mt-12 space-y-3">
              {makers.map((m) => (
                <Link key={m.id} to={`/makers/${m.id}`} className="flex items-center justify-between gap-4 rounded-[10px] border border-hair bg-white p-5 transition-colors hover:border-oxblood">
                  <span>
                    <span className="eyebrow block text-oxblood">Maker</span>
                    <span className="mt-1 block font-heading text-lg font-bold text-ink">{m.name}</span>
                    <span className="block text-[13px] text-steel">Facts, open questions and every piece in the archive</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-oxblood" />
                </Link>
              ))}
            </div>
          )}

          <SourceList sources={article.sources} />
        </div>
      </div>
    </article>
  );
}
