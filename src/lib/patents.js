export const COUNTRY_NAMES = {
  US: 'United States',
  GB: 'Great Britain',
  DE: 'Germany',
  FR: 'France',
  CA: 'Canada',
  CH: 'Switzerland',
  AT: 'Austria',
  IT: 'Italy',
  SE: 'Sweden',
  AU: 'Australia',
  Other: 'Other',
};

const PREFIX = { US: 'U.S.', GB: 'GB', DE: 'DRP', FR: 'FR', CA: 'CA', CH: 'CH', AT: 'AT', IT: 'IT', SE: 'SE', AU: 'AU' };

// "U.S. 959,496" / "DRP 376,460"
export function patentLabel(p) {
  if (!p) return '';
  const n = /^\d+$/.test(p.number || '') && p.number.length <= 8 ? Number(p.number).toLocaleString('en-US') : p.number;
  return `${PREFIX[p.country] || p.country} ${n}`;
}

export function googlePatentsUrl(p) {
  return `https://patents.google.com/patent/${p.patent_id || `${p.country}${p.number}`}/en`;
}

export function formatGrantDate(p) {
  if (p.grant_date) {
    return new Date(`${p.grant_date}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  return p.year ? String(p.year) : '';
}
