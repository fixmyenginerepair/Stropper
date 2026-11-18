// "Then and now" prices for period ads.
// Annual price indexes, used to restate an old price in today's money.
//  USD: U.S. CPI-U annual averages, 1913-2025 (BLS, via the Federal Reserve Bank of Minneapolis).
//  GBP: UK Retail Prices Index long-run series, 1900-2025 (ONS series CDKO, Jan 1974=100).
// To roll forward, append next year's annual average and bump NOW_YEAR.

export const NOW_YEAR = 2025;

const SERIES = {
  USD: { from: 1913, values: [9.9,10,10.1,10.9,12.8,15,17.3,20,17.9,16.8,17.1,17.1,17.5,17.7,17.4,17.2,17.2,16.7,15.2,13.6,12.9,13.4,13.7,13.9,14.4,14.1,13.9,14,14.7,16.3,17.3,17.6,18,19.5,22.3,24,23.8,24.1,26,26.6,26.8,26.9,26.8,27.2,28.1,28.9,29.2,29.6,29.9,30.3,30.6,31,31.5,32.5,33.4,34.8,36.7,38.8,40.5,41.8,44.4,49.3,53.8,56.9,60.6,65.2,72.6,82.4,90.9,96.5,99.6,103.9,107.6,109.6,113.6,118.3,124,130.7,136.2,140.3,144.5,148.2,152.4,156.9,160.5,163,166.6,172.2,177.1,179.9,184,188.9,195.3,201.6,207.3,215.3,214.5,218.1,224.9,229.6,233,236.7,237,240,245.1,251.1,255.7,258.8,271,292.7,304.7,313.7,321.9] },
  GBP: { from: 1900, values: [9.2,9.2,9.2,9.3,9.3,9.3,9.3,9.4,9.4,9.5,9.6,9.6,9.9,9.8,9.8,11,13,16.3,19.9,21.9,25.3,23.1,19.9,18.7,18.6,18.6,18.5,18,18,17.8,17.3,16.6,16.2,15.8,15.8,15.9,16,16.6,16.8,17.3,20.2,22.4,24,24.8,25.5,26.2,27,28.9,31.1,32,33,36,39.3,40.5,41.3,43.1,45.3,46.9,48.4,48.6,49.1,50.8,53,54,55.8,58.4,60.7,62.3,65.2,68.7,73.1,80,85.7,93.5,108.5,134.8,157.1,182,197.1,223.5,263.7,295,320.4,335.1,351.8,373.2,385.9,402,421.7,454.5,497.5,526.7,546.4,555.1,568.5,588.2,602.4,621.3,642.6,652.5,671.8,683.7,695.1,715.2,736.5,757.3,781.5,815,847.5,843,881.9,927.8,957.6,986.7,1010,1020,1037.7,1074.9,1110.8,1139.3,1156.4,1203.2,1342.6,1472.7,1525.5,1588.6] },
};

export const INDEX_SOURCES = {
  USD: 'U.S. Consumer Price Index (BLS, via the Minneapolis Fed)',
  GBP: 'UK Retail Prices Index long-run series (ONS)',
};

const indexFor = (currency, year) => {
  const s = SERIES[currency];
  if (!s || !year) return null;
  const v = s.values[Math.round(year) - s.from];
  return typeof v === 'number' ? v : null;
};

// The old price in NOW_YEAR money, or null if it can't be worked out.
export function priceToday(amount, currency, year) {
  const then = indexFor(currency, year);
  const now = indexFor(currency, NOW_YEAR);
  if (!amount || !then || !now) return null;
  return (amount * now) / then;
}

const SYMBOL = { USD: '$', GBP: '£', CAD: 'C$' };

export function formatMoney(value, currency) {
  const sym = SYMBOL[currency] || '';
  if (value >= 100) return `${sym}${(Math.round(value / 5) * 5).toLocaleString('en-US')}`;
  if (value >= 10) return `${sym}${Math.round(value)}`;
  return `${sym}${value.toFixed(2)}`;
}

// Everything a "Then / Now" display needs, or null when the ad has no usable price.
export function thenAndNow(ad) {
  if (!ad || !ad.price_then || !ad.price_currency) return null;
  const today = priceToday(ad.price_then, ad.price_currency, ad.year);
  if (!today) return null;
  return {
    printed: ad.price_printed || formatMoney(ad.price_then, ad.price_currency),
    item: ad.price_item || '',
    year: ad.year,
    approx: !!ad.year_approximate,
    currency: ad.price_currency,
    today,
    todayText: today ? formatMoney(today, ad.price_currency) : null,
    source: INDEX_SOURCES[ad.price_currency] || null,
  };
}
