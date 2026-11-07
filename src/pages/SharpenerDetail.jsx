import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DetailGallery from '@/components/detail/DetailGallery';
import RarityScale from '@/components/detail/RarityScale';
import AdminSharpenerEditor from '@/components/detail/AdminSharpenerEditor';
import { formatValue, rarityLabel } from '@/lib/archive';
import { SITE } from '@/lib/site';
import { addToBook, bookHref, readBook } from '@/lib/myBook';

const Row = ({ label, value, to }) => (
  <div className="flex flex-col gap-1 border-b border-hair py-3 sm:flex-row sm:gap-6">
    <dt className="w-40 shrink-0 text-[12px] font-semibold uppercase tracking-[0.12em] text-steel">
      {label}
    </dt>
    <dd className="text-[15px] text-ink">
      {value ? (
        to ? (
          <Link to={to} className="text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood">
            {value}
          </Link>
        ) : (
          value
        )
      ) : (
        <span className="text-steel">Not recorded</span>
      )}
    </dd>
  </div>
);

export default function SharpenerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sharpener, setSharpener] = useState(null);
  const [next, setNext] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inBook, setInBook] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMissing(false);
    setSharpener(null);

    base44.entities.Sharpener.get(id)
      .then((record) => {
        if (cancelled) return;
        setSharpener(record);
        setInBook(readBook().includes(record.id));
        return base44.entities.Sharpener.filter(
          { name: { $gt: record.name } },
          { sort: 'name', limit: 1 }
        ).then((page) => {
          if (!cancelled) setNext(page.items?.[0] || null);
        });
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });

    base44.auth
      .me()
      .then((user) => {
        if (!cancelled) setIsAdmin(user?.role === 'admin');
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!missing) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [missing]);

  if (missing) {
    return (
      <div className="archive-container py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">This sharpener isn’t recorded</h1>
        <Link to="/browse" className="mt-4 inline-block text-sm font-semibold text-oxblood">
          Back to the archive
        </Link>
      </div>
    );
  }

  if (!sharpener) {
    return (
      <div className="archive-container py-24">
        <div className="h-6 w-64 animate-pulse rounded bg-white" />
      </div>
    );
  }

  const save = async (changes) => {
    const updated = await base44.entities.Sharpener.update(sharpener.id, changes);
    setSharpener((prev) => ({ ...prev, ...changes, ...(updated || {}) }));
    return true;
  };

  const addToMyBook = () => {
    addToBook(sharpener.id);
    setInBook(true);
  };

  const mailto = `mailto:${SITE.webmaster}?subject=${encodeURIComponent(
    `Collector enquiry: ${sharpener.name}`
  )}`;

  return (
    <div className="archive-container py-8 lg:py-12">
      <nav className="flex flex-wrap items-center gap-2 text-[13px] text-steel">
        <Link to="/" className="hover:text-oxblood">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-oxblood">Browse</Link>
        <span>/</span>
        <span className="text-ink">{sharpener.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <DetailGallery sharpener={sharpener} />

        <div>
          <p className="eyebrow text-oxblood">
            {[sharpener.type, sharpener.country].filter(Boolean).join(' · ') || 'Sharpener'}
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-ink sm:text-[2.4rem]">
            {sharpener.name}
          </h1>
          {sharpener.description && (
            <p className="mt-4 text-[16px] leading-relaxed text-ink/80">{sharpener.description}</p>
          )}

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[10px] border border-hair bg-white p-5">
              <RarityScale rarity={sharpener.rarity} label={rarityLabel(sharpener.rarity)} />
            </div>
            <div className="rounded-[10px] border border-hair bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">
                Estimated value
              </p>
              <p className="mt-2 font-heading text-3xl font-bold text-ink">
                {formatValue(sharpener.value)}
              </p>
            </div>
          </div>

          <dl className="mt-8 border-t border-hair">
            <Row label="Manufacturer" value={sharpener.manufacturer} />
            <Row
              label="Type"
              value={sharpener.type}
              to={sharpener.type ? `/browse?type=${encodeURIComponent(sharpener.type)}` : null}
            />
            <Row
              label="Country"
              value={sharpener.country}
              to={sharpener.country ? `/browse?country=${encodeURIComponent(sharpener.country)}` : null}
            />
            <Row label="Patent" value={sharpener.patent} />
            <Row label="Blade" value={sharpener.blade} />
            <Row
              label="Collection"
              value={sharpener.collection}
              to={
                sharpener.collection
                  ? `/browse?collector=${encodeURIComponent(sharpener.collection)}`
                  : null
              }
            />
            <Row label="Comment" value={sharpener.comment} />
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mailto}
              className="rounded-lg bg-oxblood px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark"
            >
              Contact the collector
            </a>
            {inBook ? (
              <Link
                to={bookHref(readBook())}
                className="rounded-lg border border-ink/20 bg-white px-6 py-3 text-sm font-semibold text-oxblood transition-colors hover:border-oxblood"
              >
                In my book — open it
              </Link>
            ) : (
              <button
                onClick={addToMyBook}
                className="rounded-lg border border-ink/20 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-oxblood hover:text-oxblood"
              >
                Add to my book
              </button>
            )}
            {isAdmin && <AdminSharpenerEditor sharpener={sharpener} onSaved={save} />}
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-4 border-t border-hair pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-steel hover:text-oxblood"
        >
          <ArrowLeft className="h-4 w-4" /> Back to results
        </button>
        {next && (
          <Link
            to={`/sharpener/${next.id}`}
            className="flex items-center gap-2 text-sm font-semibold text-oxblood"
          >
            Next: {next.name} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}