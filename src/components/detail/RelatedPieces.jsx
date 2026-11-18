import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SharpenerCard from '@/components/SharpenerCard';

const FIELDS = ['id', 'name', 'legacy_id', 'type', 'country', 'images', 'rarity'];
const SHOW = 4;

// The first word of a name is usually the brand ("Zowie 2", "Twinplex 30"),
// so pieces sharing it are siblings even when no maker record links them.
function brandWord(name) {
  const word = String(name || '').trim().split(/\s+/)[0] || '';
  return word.length >= 3 ? word : '';
}

function Row({ title, more, items }) {
  if (!items.length) return null;
  return (
    <section className="mt-14">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-xl font-bold text-ink">{title}</h2>
        {more && (
          <Link to={more.to} className="text-sm font-semibold text-oxblood hover:underline">
            {more.label}
          </Link>
        )}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((s) => (
          <SharpenerCard key={s.id} sharpener={s} />
        ))}
      </div>
    </section>
  );
}

export default function RelatedPieces({ sharpener, maker }) {
  const [family, setFamily] = useState([]);
  const [sameType, setSameType] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setFamily([]);
    setSameType([]);
    const notSelf = (rows) => (rows || []).filter((r) => r.id !== sharpener.id);
    const word = brandWord(sharpener.name);

    const familyQuery = sharpener.maker_id
      ? { maker_id: sharpener.maker_id }
      : word
        ? { name: { $gte: word, $lt: `${word}￿` } }
        : null;

    const familyLoad = familyQuery
      ? base44.entities.Sharpener.filter(familyQuery, 'name', 40, 0, FIELDS).then(notSelf).catch(() => [])
      : Promise.resolve([]);

    familyLoad.then((rows) => {
      if (cancelled) return;
      // Start just after this piece so neighbours in the series come first.
      const after = rows.filter((r) => r.name > sharpener.name);
      const before = rows.filter((r) => r.name <= sharpener.name);
      const picked = [...after, ...before].slice(0, SHOW);
      setFamily(picked);

      if (!sharpener.type) return;
      const exclude = new Set(picked.map((r) => r.id));
      base44.entities.Sharpener.filter(
        { type: sharpener.type, ...(sharpener.country ? { country: sharpener.country } : {}) },
        '-rarity',
        40,
        0,
        FIELDS,
      )
        .then(notSelf)
        .then((more) => {
          if (cancelled) return;
          const pool = more.filter((r) => !exclude.has(r.id));
          // Rotate the pool by this piece's ID so each page shows a different set.
          const offset = pool.length ? parseInt(sharpener.id.slice(-4), 16) % pool.length : 0;
          setSameType([...pool.slice(offset), ...pool.slice(0, offset)].slice(0, SHOW));
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [sharpener.id, sharpener.maker_id, sharpener.name, sharpener.type, sharpener.country]);

  const familyTitle = maker ? `More from ${maker.name}` : `More ${brandWord(sharpener.name)} pieces`;
  const familyMore = maker
    ? { to: `/makers/${maker.id}`, label: 'See all' }
    : brandWord(sharpener.name)
      ? { to: `/browse?q=${encodeURIComponent(brandWord(sharpener.name))}`, label: 'See all' }
      : null;

  const typeMore = sharpener.type
    ? {
        to: `/browse?type=${encodeURIComponent(sharpener.type)}${
          sharpener.country ? `&country=${encodeURIComponent(sharpener.country)}` : ''
        }`,
        label: 'See all',
      }
    : null;

  return (
    <>
      <Row title={familyTitle} more={familyMore} items={family} />
      <Row
        title={`Other ${sharpener.type}${sharpener.country ? ` pieces from ${sharpener.country}` : ' pieces'}`}
        more={typeMore}
        items={sameType}
      />
    </>
  );
}
