import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SharpenerCard from '@/components/SharpenerCard';
import { COUNTRY_NAMES, formatGrantDate, googlePatentsUrl, patentLabel } from '@/lib/patents';

function Row({ label, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return (
    <div className="flex flex-col gap-1 border-b border-hair py-3 sm:flex-row sm:gap-6">
      <dt className="w-36 shrink-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-steel">{label}</dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  );
}

export default function PatentDetail() {
  const { id } = useParams();
  const [patent, setPatent] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [maker, setMaker] = useState(null);
  const [sheet, setSheet] = useState(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPatent(null); setPieces([]); setMaker(null); setSheet(0); setMissing(false);
    base44.entities.Patent.get(id)
      .then(async (p) => {
        if (cancelled) return;
        setPatent(p);
        document.title = `${patentLabel(p)}${p.title ? ` — ${p.title}` : ''} · Stropper.com`;
        if (p.sharpener_ids?.length) {
          const rows = await base44.entities.Sharpener.filter({ id: { $in: p.sharpener_ids } }, 'name', 200).catch(() => []);
          if (!cancelled) setPieces(rows || []);
        }
        if (p.maker_id) {
          const m = await base44.entities.Maker.get(p.maker_id).catch(() => null);
          if (!cancelled) setMaker(m);
        }
      })
      .catch(() => !cancelled && setMissing(true));
    return () => { cancelled = true; };
  }, [id]);

  if (missing) {
    return (
      <div className="archive-container py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">This patent isn’t recorded</h1>
        <Link to="/patents" className="mt-4 inline-block text-sm font-semibold text-oxblood">Back to Patents</Link>
      </div>
    );
  }
  if (!patent) return <div className="archive-container py-24"><div className="h-6 w-64 animate-pulse rounded bg-white" /></div>;

  const sheets = patent.drawing_urls || [];

  return (
    <div className="archive-container py-8 lg:py-12">
      <nav className="text-[13px] text-steel">
        <Link to="/patents" className="inline-flex items-center gap-1 hover:text-oxblood"><ArrowLeft className="h-3.5 w-3.5" /> Patents</Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div>
          {sheets.length > 0 ? (
            <>
              <a href={sheets[sheet]} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[10px] border border-hair bg-[#fbf9f4]">
                <img src={sheets[sheet]} alt={`Drawing sheet ${sheet + 1} of ${patentLabel(patent)}`} className="mx-auto max-h-[760px] w-full object-contain p-3 mix-blend-multiply" />
              </a>
              {sheets.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {sheets.map((src, i) => (
                    <button key={src} onClick={() => setSheet(i)} className={`h-24 w-[72px] overflow-hidden rounded border bg-[#fbf9f4] ${i === sheet ? 'border-oxblood ring-1 ring-oxblood' : 'border-hair'}`} aria-label={`Sheet ${i + 1}`}>
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[12.5px] text-steel">Patent drawings are in the public domain. Images via Google Patents.</p>
            </>
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center rounded-[10px] border border-dashed border-hair bg-white px-8 text-center text-steel">
              No drawing found online for this patent yet.
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow text-oxblood">{COUNTRY_NAMES[patent.country] || patent.country} patent</p>
          <h1 className="mt-3 font-heading text-[1.9rem] font-bold leading-tight text-ink sm:text-[2.4rem]">{patentLabel(patent)}</h1>
          {patent.title && <p className="mt-3 text-[19px] leading-snug text-ink/85">{patent.title}</p>}

          {patent.verified === false && patent.notes && (
            <div className="mt-5 rounded-[10px] border border-oxblood/25 bg-oxblood/5 p-4 text-[14px] leading-relaxed text-ink/85">
              <p className="eyebrow mb-1 text-oxblood">To check</p>
              {patent.notes}
            </div>
          )}

          <dl className="mt-6 border-t border-hair">
            <Row label="Granted">{formatGrantDate(patent)}</Row>
            <Row label="Inventor">{patent.inventors?.join(', ')}</Row>
            <Row label="Assigned to">{patent.assignees?.filter((a) => a && a !== 'Individual').join(', ')}</Row>
            <Row label="As marked">{patent.dates_on_items?.length ? `Dated ${patent.dates_on_items.join(', ')} on the pieces` : null}</Row>
            <Row label="Maker">{maker && <Link to={`/makers/${maker.id}`} className="text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">{maker.name}</Link>}</Row>
          </dl>

          {patent.verified !== false && patent.notes && <p className="mt-4 text-[13.5px] leading-relaxed text-steel">{patent.notes}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={googlePatentsUrl(patent)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-oxblood px-5 py-2.5 text-sm font-semibold text-white hover:bg-oxblood-dark">
              <ExternalLink className="h-4 w-4" /> View on Google Patents
            </a>
            {patent.pdf_url && (
              <a href={patent.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-ink/20 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-oxblood hover:text-oxblood">
                <FileText className="h-4 w-4" /> Full patent (PDF)
              </a>
            )}
          </div>
        </div>
      </div>

      {pieces.length > 0 && (
        <section className="mt-14">
          <h2 className="border-b border-hair pb-3 font-heading text-xl font-bold text-ink">
            Pieces in the collection marked with this patent <span className="text-steel">({pieces.length})</span>
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {pieces.map((s) => <SharpenerCard key={s.id} sharpener={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
