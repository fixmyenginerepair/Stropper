import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Link2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import RarityBandBadge from '@/components/RarityBandBadge';
import { setPageMeta } from '@/lib/pageMeta';
import { formatValue, rarityLabel, sharpenerImage } from '@/lib/archive';
import { COMPARE_MAX, clearCompare, onCompareChange, readCompare, removeFromCompare } from '@/lib/compare';
import { sharpenerPath } from '@/lib/slugs';

const yesNo = (v) => (v ? 'Yes' : v === false ? 'No' : null);

const ROWS = [
  ['Type', (s) => s.type],
  ['Country', (s) => s.country],
  ['Manufacturer', (s) => s.manufacturer],
  ['Year made', (s) => s.year_made],
  ['Rarity', (s) => (s.rarity ? `${s.rarity} · ${rarityLabel(s.rarity)}` : null)],
  ['Estimated value', (s) => (s.value ? formatValue(s.value) : null)],
  ['Patent', (s) => s.patent],
  ['Blade', (s) => s.blade],
  ['Original box', (s) => yesNo(s.has_box)],
  ['Instructions', (s) => yesNo(s.has_instructions)],
  ['Description', (s) => s.description],
];

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const fromUrl = useMemo(
    () => (params.get('ids') || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, COMPARE_MAX),
    [params],
  );
  // A shared link wins; otherwise show this visitor's own list.
  const [ids, setIds] = useState(() => (fromUrl.length ? fromUrl : readCompare()));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (fromUrl.length) setIds(fromUrl);
  }, [fromUrl]);

  useEffect(() => {
    if (fromUrl.length) return undefined;
    return onCompareChange(setIds);
  }, [fromUrl.length]);

  useEffect(() => {
    setPageMeta('Compare sharpeners · Stropper.com', 'Compare razor blade sharpeners side by side: type, maker, patent, rarity and value.');
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!ids.length) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    base44.entities.Sharpener.filter({ id: { $in: ids } }, 'name', COMPARE_MAX)
      .then((rows) => {
        if (cancelled) return;
        const byId = new Map((rows || []).map((r) => [r.id, r]));
        setItems(ids.map((id) => byId.get(id)).filter(Boolean));
        setLoading(false);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [ids]);

  const remove = (id) => {
    const next = ids.filter((x) => x !== id);
    removeFromCompare(id);
    if (fromUrl.length) {
      setParams(next.length ? { ids: next.join(',') } : {}, { replace: true });
    } else {
      setIds(next);
    }
  };

  const clear = () => {
    clearCompare();
    setParams({}, { replace: true });
    setIds([]);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/compare?ids=${items.map((s) => s.id).join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <div className="archive-container py-8 lg:py-12">
      <nav className="flex flex-wrap items-center gap-2 text-[13px] text-steel">
        <Link to="/" className="hover:text-oxblood">Home</Link>
        <span>/</span>
        <Link to="/browse" className="hover:text-oxblood">Browse</Link>
        <span>/</span>
        <span className="text-ink">Compare</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-oxblood">Side by side</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-ink">Compare sharpeners</h1>
        </div>
        {items.length > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex h-10 items-center gap-2 rounded-lg border border-ink/20 bg-white px-4 text-sm font-semibold text-ink hover:border-oxblood hover:text-oxblood"
            >
              <Link2 className="h-4 w-4" /> {copied ? 'Link copied' : 'Copy link'}
            </button>
            <button
              type="button"
              onClick={clear}
              className="h-10 rounded-lg px-3 text-sm font-semibold text-oxblood hover:bg-oxblood/10"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-10 h-64 animate-pulse rounded-[10px] bg-white" />
      ) : !items.length ? (
        <div className="mt-10 rounded-[10px] border border-hair bg-white p-10 text-center">
          <p className="text-[15px] text-ink">Nothing to compare yet.</p>
          <p className="mt-2 text-sm text-steel">
            Open any sharpener and press <strong>Compare</strong> to add it. You can line up to {COMPARE_MAX} pieces.
          </p>
          <Link to="/browse" className="mt-5 inline-block rounded-lg bg-oxblood px-5 py-2.5 text-sm font-semibold text-white">
            Browse the archive
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[10px] border border-hair bg-white">
          <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
            <thead>
              <tr>
                <th className="w-36 border-b border-hair p-4" />
                {items.map((s) => (
                  <th key={s.id} className="border-b border-l border-hair p-4 align-top font-normal">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => remove(s.id)}
                        aria-label={`Remove ${s.name}`}
                        className="absolute right-1 top-1 z-10 rounded-full bg-white/90 p-1 text-steel shadow hover:text-oxblood"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Link to={sharpenerPath(s)} className="block">
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-frost">
                          <Image src={sharpenerImage(s)} alt={s.name} className="h-full w-full object-cover" />
                          <RarityBandBadge rarity={s.rarity} className="absolute left-2 top-2" />
                        </div>
                        <p className="mt-3 font-heading text-[15px] font-bold leading-snug text-ink hover:text-oxblood">
                          {s.name}
                        </p>
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([label, get]) => {
                const values = items.map(get);
                if (values.every((v) => !v)) return null;
                const allSame = values.length > 1 && values.every((v) => v === values[0]);
                return (
                  <tr key={label}>
                    <th className="border-b border-hair p-4 align-top text-[11px] font-semibold uppercase tracking-[0.12em] text-steel">
                      {label}
                    </th>
                    {values.map((v, i) => (
                      <td
                        key={items[i].id}
                        className={`border-b border-l border-hair p-4 align-top text-[14px] ${
                          allSame ? 'text-steel' : 'text-ink'
                        }`}
                      >
                        {v || <span className="text-steel">—</span>}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-3 text-[12px] text-steel">Rows where every piece matches are shown in grey.</p>
        </div>
      )}
    </div>
  );
}
