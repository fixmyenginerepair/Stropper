import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { MAP_PANELS } from '@/lib/makerMapData';

const R = Math.PI / 180;

const project = (panel, lat, lng) => ({
  x: panel.tx + panel.scale * lng * R * panel.k,
  y: panel.ty - panel.scale * lat * R,
});

const inPanel = (panel, lat, lng) => {
  const [lon0, lat0, lon1, lat1] = panel.bbox;
  return lng >= lon0 && lng <= lon1 && lat >= lat0 && lat <= lat1;
};

// Places closer than this (in map units) share one pin, e.g. "Boston · Milton",
// so neighbouring towns don't stack their pins on top of each other.
const MERGE_DISTANCE = 22;

function clusterPlaces(panel, places) {
  const out = [];
  [...places]
    .sort((a, b) => b.makers.length - a.makers.length)
    .forEach((p) => {
      const { x, y } = project(panel, p.lat, p.lng);
      const near = out.find((c) => Math.hypot(c.x - x, c.y - y) < MERGE_DISTANCE);
      if (near) {
        near.name = `${near.name} · ${p.name}`;
        near.key = `${near.key}|${p.key}`;
        near.makers = [...near.makers, ...p.makers];
        near.parts.push(p.key);
        // Short pin label: both names when they fit, else "Boston +3".
        near.label = near.name.length <= 24 ? near.name : `${near.first} +${near.parts.length - 1}`;
      } else {
        out.push({ ...p, x, y, parts: [p.key], label: p.name, first: p.name });
      }
    });
  return out;
}

// Labels that would collide with a neighbour go on the left of the pin.
const LEFT_LABELS = new Set(['Geneva, NY', 'Lucerne']);
// Same, matched on any place inside a shared pin (keys are lower-case place names).
const LEFT_KEYS = new Set(['adrian, mi', 'swanton, oh']);

function MapPanel({ panel, places, selected, onSelect }) {
  return (
    <figure className="min-w-0 overflow-hidden rounded-[12px] border border-hair bg-white">
      <figcaption className="flex items-center justify-between border-b border-hair px-4 py-3">
        <span className="eyebrow text-steel">{panel.title}</span>
        <span className="text-[12px] text-steel">
          {places.reduce((n, p) => n + p.makers.length, 0)} makers
        </span>
      </figcaption>
      <svg viewBox={`0 0 ${panel.W} ${panel.H}`} className="block h-auto w-full bg-[#e3e8f2]" role="img" aria-label={`Map of ${panel.title} makers`}>
        <path d={panel.land} fill="#f7f3ea" stroke="#b8b1a2" strokeWidth="0.7" />
        {panel.nation && <path d={panel.nation} fill="none" stroke="#a39c8c" strokeWidth="0.8" />}
        {panel.states && <path d={panel.states} fill="none" stroke="#d6d0c1" strokeWidth="0.6" />}
        <path d={panel.borders} fill="none" stroke="#cdc6b6" strokeWidth="0.7" />
        {places.map((place) => {
          const { x, y } = project(panel, place.lat, place.lng);
          const active = selected === place.key || (place.parts || []).includes(selected);
          const left = LEFT_LABELS.has(place.name) || (place.parts || []).some((k) => LEFT_KEYS.has(k));
          return (
            <g
              key={place.key}
              role="button"
              tabIndex={0}
              aria-label={`${place.name}: ${place.makers.map((m) => m.name).join(', ')}`}
              onClick={() => onSelect(place.key)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(place.key))}
              className="cursor-pointer outline-none"
            >
              {active && (
                <circle cx={x} cy={y} r="22" fill="#680000" opacity="0.18">
                  <animate attributeName="r" values="14;26;14" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={x} cy={y} r="24" fill="transparent" />
              <circle cx={x} cy={y} r={active ? 11 : 9} fill={active ? '#010068' : '#680000'} stroke="#fff" strokeWidth="3" />
              {place.makers.length > 1 && (
                <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                  {place.makers.length}
                </text>
              )}
              <text
                x={left ? x - 16 : x + 16}
                y={y + 6}
                textAnchor={left ? 'end' : 'start'}
                fontSize="18"
                fontWeight={active ? 700 : 600}
                fill="#1B2333"
                stroke="#f7f3ea"
                strokeWidth="5"
                paintOrder="stroke"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                {place.label || place.name}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function MakerLinks({ maker, story }) {
  return (
    <li className="flex flex-col gap-1 border-b border-hair py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <p className="font-heading text-[17px] font-bold text-ink">{maker.name}</p>
        <p className="text-[13px] text-steel">
          {[maker.country, maker.founded_year ? `founded ${maker.founded_year}` : null].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-x-4 gap-y-1 text-[14px] font-semibold">
        {story && (
          <Link to={`/history/${story.slug}`} className="inline-flex items-center gap-1 text-oxblood hover:underline">
            Read the story <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link to={`/makers/${maker.id}`} className="text-steel hover:text-oxblood">
          Maker page
        </Link>
      </div>
    </li>
  );
}

export default function MakersMap() {
  useEffect(() => { document.title = 'Map of Razor Blade Sharpener Makers | Stropper.com'; }, []);
  const [makers, setMakers] = useState([]);
  const [stories, setStories] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      base44.entities.Maker.list('name', 200),
      base44.entities.Article.list('-published_date', 200).catch(() => []),
    ])
      .then(([m, a]) => {
        if (cancelled) return;
        setMakers(m || []);
        const byMaker = {};
        (a || [])
          .filter((art) => !art.status || art.status === 'Published')
          .forEach((art) => (art.maker_ids || []).forEach((id) => (byMaker[id] ||= art)));
        setStories(byMaker);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const places = useMemo(() => {
    const map = new Map();
    makers
      .filter((m) => typeof m.lat === 'number' && typeof m.lng === 'number')
      .forEach((m) => {
        const name = m.map_place || m.city || m.country;
        const key = name.toLowerCase();
        if (!map.has(key)) map.set(key, { key, name, lat: m.lat, lng: m.lng, makers: [] });
        map.get(key).makers.push(m);
      });
    return [...map.values()];
  }, [makers]);

  const unplaced = makers.filter((m) => typeof m.lat !== 'number' || typeof m.lng !== 'number');
  const panelPlaces = MAP_PANELS.map((panel) => ({
    panel,
    places: clusterPlaces(panel, places.filter((p) => inPanel(panel, p.lat, p.lng))),
  }));
  const elsewhere = places.filter((p) => !MAP_PANELS.some((panel) => inPanel(panel, p.lat, p.lng)));
  const current =
    panelPlaces.flatMap((p) => p.places).find((p) => p.key === selected) ||
    places.find((p) => p.key === selected);

  const select = (key) => {
    setSelected(key);
    requestAnimationFrame(() =>
      document.getElementById('map-selection')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    );
  };

  return (
    <div className="archive-container py-10 lg:py-14">
      <p className="eyebrow text-oxblood">Makers map</p>
      <h1 className="mt-3 max-w-3xl font-heading text-[2rem] font-bold leading-tight text-ink sm:text-[2.6rem]">
        Where the sharpeners were made
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-steel">
        From St. Louis to Solingen, the stropping boom ran on both sides of the Atlantic. Tap a pin to meet the makers
        there and read their stories.
      </p>

      {loading ? (
        <div className="mt-10 h-72 animate-pulse rounded-[12px] bg-white" />
      ) : (
        <>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {panelPlaces.map(({ panel, places: ps }) => (
              <MapPanel key={panel.key} panel={panel} places={ps} selected={selected} onSelect={select} />
            ))}
          </div>

          <div id="map-selection" className="scroll-mt-24">
            {current ? (
              <section className="mt-6 rounded-[12px] border-2 border-navy bg-white p-5 sm:p-6">
                <p className="flex items-center gap-2 eyebrow text-oxblood">
                  <MapPin className="h-4 w-4" /> {current.name}
                </p>
                <ul className="mt-2">
                  {current.makers.map((m) => (
                    <MakerLinks key={m.id} maker={m} story={stories[m.id]} />
                  ))}
                </ul>
              </section>
            ) : (
              <p className="mt-6 text-center text-[14px] text-steel">Tap a pin to see the makers there.</p>
            )}
          </div>

          <section className="mt-14 border-t border-hair pt-10">
            <h2 className="font-heading text-2xl font-bold text-ink">Every maker, by place</h2>
            <div className="mt-6 grid gap-x-10 gap-y-8 md:grid-cols-2">
              {[...places, ...elsewhere.filter((p) => !places.includes(p))]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((place) => (
                  <div key={place.key} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => select(place.key)}
                      className="flex items-center gap-2 eyebrow text-steel hover:text-oxblood"
                    >
                      <MapPin className="h-4 w-4" /> {place.name}
                    </button>
                    <ul className="mt-1">
                      {place.makers.map((m) => (
                        <MakerLinks key={m.id} maker={m} story={stories[m.id]} />
                      ))}
                    </ul>
                  </div>
                ))}
              {unplaced.length > 0 && (
                <div className="min-w-0">
                  <p className="eyebrow text-steel">Place not yet known</p>
                  <ul className="mt-1">
                    {unplaced.map((m) => (
                      <MakerLinks key={m.id} maker={m} story={stories[m.id]} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
