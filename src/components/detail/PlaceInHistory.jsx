import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { eraFor, loadAds, loadPatents, patentYear, SHARPENER_CARD_FIELDS } from '@/lib/eras';
import { patentLabel } from '@/lib/patents';
import { sharpenerPath } from '@/lib/slugs';

// "Its place in history": dates the piece by the earliest patent it carries and
// sets it among the inventions, makers and advertising of the same decade.

const SIBLINGS = 4;

export default function PlaceInHistory({ sharpener, maker, patents }) {
  const dated = useMemo(
    () => [...(patents || [])].filter((p) => patentYear(p)).sort((a, b) => patentYear(a) - patentYear(b)),
    [patents],
  );
  const first = dated[0];
  const year = patentYear(first) || Number(sharpener.year_made) || null;
  const era = eraFor(year);
  const decade = era?.decade;
  const drawing = dated.find((p) => p.drawing_urls?.length);

  const [siblings, setSiblings] = useState([]);
  const [ad, setAd] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setSiblings([]);
    setAd(null);
    if (!decade) return undefined;

    loadPatents().then((all) => {
      // Other pieces whose earliest patent falls in the same decade.
      const firstYear = new Map();
      all.forEach((p) => {
        const y = patentYear(p);
        if (!y) return;
        (p.sharpener_ids || []).forEach((id) => {
          if (!firstYear.has(id) || y < firstYear.get(id)) firstYear.set(id, y);
        });
      });
      const ids = [...firstYear.entries()]
        .filter(([id, y]) => id !== sharpener.id && Math.floor(y / 10) * 10 === decade)
        .map(([id]) => id);
      // Rotate by this piece's ID so neighbouring pages show different company.
      const offset = ids.length ? parseInt(sharpener.id.slice(-5), 16) % ids.length : 0;
      const pick = [...ids.slice(offset), ...ids.slice(0, offset)].slice(0, 24);
      if (!pick.length) return;
      base44.entities.Sharpener.filter({ id: { $in: pick } }, null, pick.length, 0, SHARPENER_CARD_FIELDS)
        .then((rows) => {
          if (!cancelled) setSiblings((rows || []).filter((s) => s.images?.length).slice(0, SIBLINGS));
        })
        .catch(() => {});
    });

    loadAds().then((ads) => {
      if (cancelled) return;
      const withImage = ads.filter((a) => a.image);
      const byMaker = maker ? withImage.find((a) => a.maker_id === maker.id) : null;
      const byDecade = withImage.find((a) => a.year && Math.floor(a.year / 10) * 10 === decade);
      setAd(byMaker || byDecade || null);
    });

    return () => {
      cancelled = true;
    };
  }, [sharpener.id, decade, maker]);

  if (!era) return null;

  return (
    <section className="mt-16">
      <div className="rope-frame bg-[#fbf7ee]">
        <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-12 lg:py-12">
          <div>
            <p className="eyebrow text-oxblood">Its place in history</p>
            <div className="mt-5 flex items-start gap-5">
              <span className="price-tag shrink-0">
                <span className="ad-script text-[15px] leading-none">{first ? 'pat.' : 'made'}</span>
                <span className="font-heading text-[2.4rem] font-black leading-none">{year}</span>
              </span>
              <div>
                <p className="font-fell text-[12px] font-semibold uppercase tracking-[0.22em] text-steel">The {decade}s</p>
                <h2 className="mt-1 font-heading text-[1.9rem] font-extrabold leading-tight text-ink sm:text-[2.2rem]">{era.name}</h2>
              </div>
            </div>
            {era.story && <p className="drop-cap mt-6 text-[17px] leading-relaxed text-ink/85">{era.story}</p>}

            <ul className="mt-6 space-y-2 border-t-2 border-[#15120e] pt-4 text-[16px]">
              {first && (
                <li>
                  <span className="ad-script text-oxblood">Patented </span>
                  <Link to={`/patents/${first.id}`} className="font-semibold text-ink underline decoration-oxblood/40 underline-offset-4 hover:decoration-oxblood">
                    {patentLabel(first)}
                  </Link>
                  {first.title ? <span className="text-steel"> — {first.title}</span> : null}
                  {first.inventors?.length ? <span className="text-steel">, by {first.inventors.slice(0, 2).join(' & ')}</span> : null}
                </li>
              )}
              {dated.length > 1 && (
                <li className="text-steel">
                  <span className="ad-script text-oxblood">and </span>
                  {dated.length - 1} later patent{dated.length > 2 ? 's' : ''} through {patentYear(dated[dated.length - 1])}
                </li>
              )}
              {maker && (
                <li>
                  <span className="ad-script text-oxblood">Made by </span>
                  <Link to={`/makers/${maker.id}`} className="font-semibold text-ink underline decoration-oxblood/40 underline-offset-4 hover:decoration-oxblood">
                    {maker.name}
                  </Link>
                  {maker.city ? <span className="text-steel">, {maker.city.split(/[(;]/)[0].trim()}</span> : null}
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            {drawing ? (
              <Link to={`/patents/${drawing.id}`} className="group block border-2 border-[#15120e] bg-paper p-3 shadow-[6px_6px_0_#15120e]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={drawing.drawing_urls[0]} alt={`Drawing for ${patentLabel(drawing)}`} loading="lazy" className="ink-on-paper h-full w-full object-contain transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-2 flex items-baseline justify-between gap-3 border-t border-ink/50 pt-2">
                  <span className="ad-script text-[15px] text-ink">The inventor’s drawing</span>
                  <span className="font-fell text-[11px] font-semibold uppercase tracking-[0.2em] text-oxblood">{patentLabel(drawing)}</span>
                </p>
              </Link>
            ) : null}

            {ad && (
              <Link to={`/advertising?ad=${ad.id}`} className="group flex items-center gap-4 border-2 border-[#15120e] bg-[#15120e] p-3 text-paper transition-colors hover:bg-oxblood">
                <img src={ad.image} alt="" loading="lazy" className="h-24 w-20 shrink-0 object-cover grayscale-[.3]" />
                <span>
                  <span className="font-fell text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/70">
                    {ad.maker_id && maker && ad.maker_id === maker.id ? 'Advertised at the time' : 'In the magazines'} · {ad.year}
                  </span>
                  <span className="mt-1 block font-heading text-[18px] font-bold italic leading-snug">“{ad.title}”</span>
                  <span className="block font-ui text-[12px] text-paper/70">{ad.brand}</span>
                </span>
              </Link>
            )}
          </div>
        </div>

        {siblings.length > 0 && (
          <div className="border-t-2 border-[#15120e] px-6 py-8 sm:px-10 lg:px-12">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-heading text-[1.5rem] font-extrabold text-ink">
                <span className="ad-script font-medium text-oxblood">Also new in the </span>
                {decade}s
              </h3>
              <Link to={`/patents?decade=${decade}`} className="inline-flex items-center gap-1.5 font-fell text-[12px] font-bold uppercase tracking-[0.16em] text-oxblood hover:underline">
                Every {decade}s patent <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              {siblings.map((s) => (
                <Link key={s.id} to={sharpenerPath(s)} className="group block border-2 border-[#15120e] bg-white p-1.5 transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_#680000]">
                  <img src={s.images[0]} alt={s.name} loading="lazy" className="aspect-square w-full object-cover" />
                  <span className="mt-2 block px-1 pb-1 font-heading text-[15px] font-bold leading-tight text-ink group-hover:text-oxblood">{s.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
