import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Printer } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { RARITY_LABELS, sharpenerImage } from '@/lib/archive';

const LEVELS = ['9', '8', '7'];
const STORE = 'stropper:have';

// "I have this" ticks are kept in this browser only.
const readHave = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE) || '[]'));
  } catch {
    return new Set();
  }
};
const writeHave = (set) => {
  try {
    localStorage.setItem(STORE, JSON.stringify([...set]));
  } catch {
    /* storage unavailable: ticks last for this visit only */
  }
};

export default function MostWanted() {
  useEffect(() => { document.title = 'Most Wanted Razor Blade Sharpeners: Rarity Checklist | Stropper.com'; }, []);
  const [rows, setRows] = useState(null);
  const [levels, setLevels] = useState(['9', '8']);
  const [have, setHave] = useState(readHave);
  const [hideHave, setHideHave] = useState(false);

  useEffect(() => {
    base44.entities.Sharpener.filter({ rarity: { $in: LEVELS } }, 'name', 1000)
      .then((r) => setRows(Array.isArray(r) ? r : r?.items || []))
      .catch(() => setRows([]));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    (rows || []).forEach((s) => (c[s.rarity] = (c[s.rarity] || 0) + 1));
    return c;
  }, [rows]);

  const shown = useMemo(
    () =>
      (rows || [])
        .filter((s) => levels.includes(s.rarity))
        .filter((s) => !(hideHave && have.has(s.id)))
        .sort((a, b) => Number(b.rarity) - Number(a.rarity) || a.name.localeCompare(b.name)),
    [rows, levels, hideHave, have]
  );
  const inScope = (rows || []).filter((s) => levels.includes(s.rarity));
  const haveCount = inScope.filter((s) => have.has(s.id)).length;

  const toggleLevel = (l) =>
    setLevels((cur) => (cur.includes(l) ? (cur.length > 1 ? cur.filter((x) => x !== l) : cur) : [...cur, l]));
  const toggleHave = (id) =>
    setHave((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      writeHave(next);
      return next;
    });

  return (
    <div className="archive-container py-10 lg:py-14">
      <p className="eyebrow text-oxblood">Rarity checklist</p>
      <h1 className="mt-3 max-w-3xl font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.6rem]">Most wanted</h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-steel">
        The rarest sharpeners in the archive, graded on the collection’s 1–9 rarity scale. Tick the ones you own to track your
        hunt; your ticks stay in this browser. Print the list to take to a show.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-2 print:hidden">
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => toggleLevel(l)}
            aria-pressed={levels.includes(l)}
            className={`rounded-full border px-4 py-1.5 text-[13px] transition-colors ${
              levels.includes(l) ? 'border-navy bg-navy text-white' : 'border-hair bg-white text-ink hover:border-navy/40'
            }`}
          >
            {l} · {RARITY_LABELS[l]} {rows && <span className="opacity-70">({counts[l] || 0})</span>}
          </button>
        ))}
        <label className="ml-1 flex items-center gap-2 text-[13px] text-ink">
          <input type="checkbox" checked={hideHave} onChange={(e) => setHideHave(e.target.checked)} className="h-4 w-4 accent-oxblood" />
          Hide ones I have
        </label>
        <button
          type="button"
          onClick={() => window.print()}
          className="ml-auto flex items-center gap-2 rounded-lg border border-hair bg-white px-4 py-2 text-sm font-medium text-ink hover:border-oxblood hover:text-oxblood"
        >
          <Printer className="h-4 w-4" /> Print checklist
        </button>
      </div>

      {rows && (
        <div className="mt-6 print:hidden">
          <div className="flex items-baseline justify-between text-[13px] text-steel">
            <span>
              You have <strong className="text-ink">{haveCount}</strong> of {inScope.length}
            </span>
            <span>{inScope.length ? Math.round((haveCount / inScope.length) * 100) : 0}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-hair">
            <div className="h-full rounded-full bg-oxblood transition-all" style={{ width: `${inScope.length ? (haveCount / inScope.length) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {rows === null ? (
        <div className="mt-8 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[10px] bg-white" />
          ))}
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-hair overflow-hidden rounded-[12px] border border-hair bg-white">
          {shown.map((s) => {
            const owned = have.has(s.id);
            return (
              <li key={s.id} className={`flex items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 ${owned ? 'bg-frost/60' : ''}`}>
                <button
                  type="button"
                  onClick={() => toggleHave(s.id)}
                  aria-pressed={owned}
                  aria-label={owned ? `Untick ${s.name}` : `Tick ${s.name} as owned`}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                    owned ? 'border-oxblood bg-oxblood text-white' : 'border-ink/30 bg-white hover:border-oxblood'
                  }`}
                >
                  {owned && <Check className="h-4 w-4" />}
                </button>
                <Link to={`/sharpener/${s.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-frost print:hidden">
                    <Image src={sharpenerImage(s)} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-heading text-[16px] font-bold text-ink ${owned ? 'line-through decoration-oxblood/50' : ''}`}>{s.name}</p>
                    <p className="truncate text-[13px] text-steel">{[s.type, s.country].filter(Boolean).join(' · ')}</p>
                  </div>
                </Link>
                <span className="shrink-0 rounded-full border border-oxblood/30 px-2.5 py-0.5 text-[12px] font-semibold text-oxblood">
                  {s.rarity} <span className="hidden sm:inline">· {RARITY_LABELS[s.rarity]}</span>
                </span>
              </li>
            );
          })}
          {shown.length === 0 && <li className="px-4 py-8 text-center text-[14px] text-steel">Nothing left to show. You have them all!</li>}
        </ul>
      )}
    </div>
  );
}
