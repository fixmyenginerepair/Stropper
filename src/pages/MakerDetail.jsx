import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Markdown, { SourceList } from '@/components/history/Markdown';
import SharpenerCard from '@/components/SharpenerCard';
import MakerTimeline from '@/components/makers/MakerTimeline';

const SHOW = 24;

function Fact({ label, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return (
    <div className="flex flex-col gap-1 border-b border-hair py-3 sm:flex-row sm:gap-6">
      <dt className="w-36 shrink-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-steel">{label}</dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  );
}

export default function MakerDetail() {
  const { id } = useParams();
  const [maker, setMaker] = useState(null);
  const [articles, setArticles] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [total, setTotal] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMaker(null);
    setMissing(false);
    base44.entities.Maker.get(id)
      .then((m) => {
        if (cancelled) return;
        setMaker(m);
        document.title = `${m.name} · Stropper.com`;
      })
      .catch(() => !cancelled && setMissing(true));
    base44.entities.Article.filter({ status: 'Published', maker_ids: id }, '-published_date', 20)
      .then((rows) => !cancelled && setArticles(rows || []))
      .catch(() => {});
    Promise.all([
      base44.entities.Sharpener.count({ maker_id: id }),
      base44.entities.Sharpener.filter({ maker_id: id }, 'name', 500),
    ]).then(([n, rows]) => {
      if (cancelled) return;
      setTotal(n || 0);
      setPieces(rows || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  if (missing) {
    return (
      <div className="archive-container py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">This maker isn’t recorded</h1>
        <Link to="/history" className="mt-4 inline-block text-sm font-semibold text-oxblood">Back to History</Link>
      </div>
    );
  }
  if (!maker) return <div className="archive-container py-24"><div className="h-6 w-64 animate-pulse rounded bg-white" /></div>;

  const [cover, ...gallery] = maker.images || [];
  const years = [maker.founded_year, maker.closed_year].filter(Boolean).join(' – ');
  const shown = showAll ? pieces : pieces.slice(0, SHOW);

  return (
    <div className="pb-16">
      {cover && (
        <div className="bg-navy">
          <img src={cover} alt="" className="mx-auto block max-h-[420px] w-full max-w-6xl object-cover" />
        </div>
      )}
      <div className="archive-container">
        <nav className="pt-8 text-[13px] text-steel">
          <Link to="/history" className="inline-flex items-center gap-1 hover:text-oxblood"><ArrowLeft className="h-3.5 w-3.5" /> History</Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
          <div className="min-w-0">
            <p className="eyebrow text-oxblood">Maker{years && ` · ${years}`}</p>
            <h1 className="mt-3 font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.5rem]">{maker.name}</h1>
            <div className="max-w-[720px]"><Markdown>{maker.history}</Markdown></div>

            <MakerTimeline maker={maker} pieces={pieces} />

            {articles.map((a) => (
              <Link key={a.id} to={`/history/${a.slug || a.id}`} className="mt-8 flex max-w-[720px] items-center justify-between gap-4 rounded-[10px] border border-hair bg-white p-5 transition-colors hover:border-oxblood">
                <span>
                  <span className="eyebrow block text-oxblood">Read the full history</span>
                  <span className="mt-1 block font-heading text-lg font-bold text-ink">{a.title}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-oxblood" />
              </Link>
            ))}

            {gallery.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[10px] border border-hair bg-white">
                    <img src={src} alt="" loading="lazy" className="aspect-[4/3] w-full object-contain p-2" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:pt-14">
            <dl className="border-t border-hair">
              <Fact label="Based in">{[maker.city, maker.country].filter(Boolean).join(', ')}</Fact>
              <Fact label="Years">{years}</Fact>
              <Fact label="Key people">{maker.key_people}</Fact>
              <Fact label="Patents">{maker.patents?.join('; ')}</Fact>
              <Fact label="Also known as">{maker.aliases?.join(', ')}</Fact>
              <Fact label="In the archive">{total ? `${total} piece${total === 1 ? '' : 's'}` : 'None yet'}</Fact>
            </dl>
            {maker.open_questions && (
              <div className="mt-6 rounded-[10px] border border-oxblood/25 bg-oxblood/5 p-5">
                <h2 className="eyebrow text-oxblood">Still to be confirmed</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[13.5px] leading-relaxed text-ink/80">
                  {maker.open_questions.split('\n').filter(Boolean).map((q) => <li key={q}>{q}</li>)}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {pieces.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4 border-b border-hair pb-3">
              <h2 className="font-heading text-xl font-bold text-ink">In the archive <span className="text-steel">({total})</span></h2>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {shown.map((s) => <SharpenerCard key={s.id} sharpener={s} />)}
            </div>
            {pieces.length > SHOW && !showAll && (
              <div className="mt-6 text-center">
                <button onClick={() => setShowAll(true)} className="rounded-lg border border-hair bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-oxblood hover:text-oxblood">
                  Show all {pieces.length}
                </button>
              </div>
            )}
          </section>
        )}

        <div className="max-w-[720px]"><SourceList sources={maker.sources} /></div>
      </div>
    </div>
  );
}