import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import RarityFilter from '@/components/mostwanted/RarityFilter';
import WantedCard from '@/components/mostwanted/WantedCard';

const LEVELS = ['9', '8', '7'];

export default function MostWanted() {
  useEffect(() => {
    document.title = 'Most Wanted Razor Blade Sharpeners: The Rarest Pieces | Stropper.com';
  }, []);

  const [rows, setRows] = useState(null);
  const [levels, setLevels] = useState(['9', '8']);

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
        .sort((a, b) => Number(b.rarity) - Number(a.rarity) || a.name.localeCompare(b.name)),
    [rows, levels]
  );

  const toggleLevel = (l) =>
    setLevels((cur) =>
      cur.includes(l) ? (cur.length > 1 ? cur.filter((x) => x !== l) : cur) : [...cur, l]
    );

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">Most wanted</p>
        <h1 className="mt-3 font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.6rem]">
          The rarest in the archive
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-steel">
          Graded on the collection’s 1–9 rarity scale, from extremely rare to the only known example.
        </p>
      </header>

      <div className="mt-9">
        <RarityFilter
          levels={LEVELS}
          active={levels}
          counts={rows ? counts : null}
          total={rows ? shown.length : 0}
          onToggle={toggleLevel}
        />
      </div>

      {rows === null ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-hair bg-white">
              <div className="aspect-[4/3] animate-pulse bg-frost" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-2/3 animate-pulse rounded bg-frost" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-frost" />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-hair bg-white p-12 text-center">
          <h2 className="font-heading text-xl font-bold text-ink">Nothing at this grade</h2>
          <p className="mt-2 text-[15px] text-steel">Pick another rarity level above.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {shown.map((s) => (
            <WantedCard key={s.id} sharpener={s} />
          ))}
        </div>
      )}
    </div>
  );
}