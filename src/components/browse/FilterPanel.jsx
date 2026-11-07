import { useEffect, useState } from 'react';
import {
  ALPHABET,
  COUNTRY_VALUES,
  RARITY_LABELS,
  RARITY_VALUES,
  SHARPENER_TYPES,
} from '@/lib/archive';

const fieldClass =
  'h-11 w-full rounded-lg border border-hair bg-white px-3 text-sm text-ink focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood';

const labelClass = 'mt-5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-steel';

export default function FilterPanel({ values, onApply, onClear }) {
  const [word, setWord] = useState(values.q);
  const [collector, setCollector] = useState(values.collector);

  useEffect(() => setWord(values.q), [values.q]);
  useEffect(() => setCollector(values.collector), [values.collector]);

  const submit = (event) => {
    event.preventDefault();
    onApply({ q: word.trim(), collector: collector.trim() });
  };

  return (
    <form onSubmit={submit} className="rounded-[10px] border border-hair bg-white p-5">
      <h2 className="font-heading text-lg font-bold text-ink">Filters</h2>

      <label htmlFor="filter-word" className={labelClass}>
        Search word
      </label>
      <input
        id="filter-word"
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Model, maker, patent"
        className={`mt-2 ${fieldClass}`}
      />

      <p className={labelClass}>A–Z</p>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {ALPHABET.map((letter) => {
          const active = values.letter === letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => onApply({ letter: active ? '' : letter })}
              className={`h-8 rounded-md border text-[12px] font-medium transition-colors ${
                active
                  ? 'border-oxblood bg-oxblood text-white'
                  : 'border-hair text-steel hover:border-oxblood hover:text-oxblood'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <label htmlFor="filter-country" className={labelClass}>
        Country
      </label>
      <select
        id="filter-country"
        value={values.country}
        onChange={(e) => onApply({ country: e.target.value })}
        className={`mt-2 ${fieldClass}`}
      >
        <option value="">All countries</option>
        {COUNTRY_VALUES.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>

      <label htmlFor="filter-type" className={labelClass}>
        Type
      </label>
      <select
        id="filter-type"
        value={values.type}
        onChange={(e) => onApply({ type: e.target.value })}
        className={`mt-2 ${fieldClass}`}
      >
        <option value="">All types</option>
        {values.type && !SHARPENER_TYPES.includes(values.type) && (
          <option value={values.type}>{values.type}</option>
        )}
        {SHARPENER_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <label htmlFor="filter-rarity" className={labelClass}>
        Rarity
      </label>
      <select
        id="filter-rarity"
        value={values.rarity}
        onChange={(e) => onApply({ rarity: e.target.value })}
        className={`mt-2 ${fieldClass}`}
      >
        <option value="">Any rarity</option>
        {RARITY_VALUES.map((value) => (
          <option key={value} value={value}>
            {value === 'T' ? 'T — trade / one-off' : `${value} — ${RARITY_LABELS[value]}`}
          </option>
        ))}
      </select>

      <label htmlFor="filter-collector" className={labelClass}>
        Collector ID
      </label>
      <input
        id="filter-collector"
        value={collector}
        onChange={(e) => setCollector(e.target.value)}
        placeholder="e.g. SW-1024"
        className={`mt-2 ${fieldClass}`}
      />

      <label htmlFor="filter-updated" className={labelClass}>
        Updated within
      </label>
      <select
        id="filter-updated"
        value={values.updated}
        onChange={(e) => onApply({ updated: e.target.value })}
        className={`mt-2 ${fieldClass}`}
      >
        <option value="">Any time</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>

      <button
        type="submit"
        className="mt-6 h-11 w-full rounded-lg bg-oxblood text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark"
      >
        Show results
      </button>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 w-full text-center text-[13px] font-medium text-steel underline decoration-steel/30 underline-offset-4 hover:text-oxblood"
      >
        Clear filters
      </button>
    </form>
  );
}