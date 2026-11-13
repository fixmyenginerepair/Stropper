import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const yearLabel = (ad) => (ad.year ? `${ad.year_approximate ? 'c. ' : ''}${ad.year}` : 'Undated');

function AdCard({ ad, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(ad)}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-hair bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-[3/4] items-start justify-center overflow-hidden bg-[#f4f1ea]">
        <img
          src={ad.image}
          alt={ad.title}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow text-oxblood">
          {yearLabel(ad)} · {ad.brand}
        </p>
        <h3 className="mt-2 font-heading text-[16px] font-bold leading-snug text-ink">{ad.title}</h3>
        {ad.publication && <p className="mt-1 text-[13px] text-steel">{ad.publication}</p>}
      </div>
    </button>
  );
}

function AdViewer({ ad, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={ad.title}
    >
      <div
        className="relative my-auto grid w-full max-w-5xl gap-6 rounded-[12px] bg-white p-4 sm:p-6 md:grid-cols-[3fr_2fr]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-ink shadow hover:bg-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <a href={ad.image} target="_blank" rel="noreferrer" className="block bg-[#f4f1ea]">
          <img src={ad.image} alt={ad.title} className="mx-auto max-h-[80vh] w-auto" />
        </a>
        <div>
          <p className="eyebrow text-oxblood">
            {yearLabel(ad)} · {ad.audience || 'Consumer'} ad
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink">{ad.title}</h2>
          {ad.summary && <p className="mt-3 text-[15px] leading-relaxed text-steel">{ad.summary}</p>}
          <dl className="mt-5 space-y-3 text-[14px]">
            {[
              ['Brand', ad.brand],
              ['Advertiser', ad.advertiser],
              ['Ran in', ad.publication],
              ['Date', ad.published_date],
              ['Prices quoted', ad.prices_quoted],
              ['Image source', ad.source_note],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="font-semibold text-ink">{k}</dt>
                  <dd className="text-steel">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default function Advertising() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState('All');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    base44.entities.PeriodAd.list('year', 500).then((rows) => {
      setAds(Array.isArray(rows) ? rows : rows?.items || []);
      setLoading(false);
    });
  }, []);

  const brands = useMemo(
    () => ['All', ...Array.from(new Set(ads.map((a) => a.brand).filter(Boolean))).sort()],
    [ads]
  );
  const shown = brand === 'All' ? ads : ads.filter((a) => a.brand === brand);

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">From the archive</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          Period advertising
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-steel">
          How the makers sold razors, strops and sharpeners to customers and to the dealers who
          stocked them. Before cheap disposable blades, the pitch was simple: keep your blade sharp
          and make it last.
        </p>
      </header>

      {brands.length > 2 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBrand(b)}
              className={`rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
                brand === b
                  ? 'border-navy bg-navy text-white'
                  : 'border-hair bg-white text-ink hover:border-navy/40'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="mt-9 text-sm text-steel">Loading the ads…</p>
      ) : shown.length === 0 ? (
        <p className="mt-9 text-sm text-steel">No ads in the archive yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {shown.map((ad) => (
            <AdCard key={ad.id} ad={ad} onOpen={setOpen} />
          ))}
        </div>
      )}

      {open && <AdViewer ad={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
