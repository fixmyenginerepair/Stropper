export const money = (n) =>
  Number.isFinite(Number(n)) ? `$${Math.round(Number(n)).toLocaleString('en-US')}` : '—';

const quantile = (sorted, q) => {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1];
  return next === undefined ? sorted[base] : sorted[base] + rest * (next - sorted[base]);
};

const positive = (n) => Number.isFinite(Number(n)) && Number(n) > 0;

/**
 * Builds the price range shown on a piece:
 * a curated range (value_low / value_high) wins, otherwise the middle half of
 * the values recorded for the same type in the archive.
 */
export function buildValueGuide(item, rows) {
  const values = (rows || [])
    .filter((r) => r.id !== item?.id && positive(r.value))
    .map((r) => Number(r.value))
    .sort((a, b) => a - b);

  const count = values.length;
  const median = count ? Math.round(quantile(values, 0.5)) : null;
  const value = positive(item?.value) ? Number(item.value) : null;

  const low = positive(item?.value_low) ? Number(item.value_low) : null;
  const high = positive(item?.value_high) ? Number(item.value_high) : null;
  const curated = low !== null && high !== null && high > low;

  let rangeLow = null;
  let rangeHigh = null;
  if (curated) {
    rangeLow = low;
    rangeHigh = high;
  } else if (count >= 3) {
    rangeLow = Math.round(quantile(values, 0.25));
    rangeHigh = Math.round(quantile(values, 0.75));
  }

  const max = Math.max(rangeHigh || 0, median || 0, value || 0, values[count - 1] || 0);

  return {
    count,
    median,
    value,
    low: rangeLow,
    high: rangeHigh,
    source: curated ? 'curated' : rangeLow !== null ? 'archive' : 'none',
    max,
  };
}

// How this piece sits against the median value of its type.
export function standingNote(guide, type) {
  if (!guide.value || !guide.median || guide.source !== 'archive') return null;
  const diff = Math.round(((guide.value - guide.median) / guide.median) * 100);
  if (Math.abs(diff) < 10) return `In line with the median for ${type} in the archive.`;
  return `${Math.abs(diff)}% ${diff > 0 ? 'above' : 'below'} the median for ${type} in the archive.`;
}