export const KIND_LABELS = {
  sql: 'Database',
  php: 'PHP source',
  html: 'HTML & templates',
  css: 'Stylesheets',
  javascript: 'JavaScript',
  java: 'Java',
  image: 'Pictures',
  document: 'Documents',
  capture: 'Other captures',
  page: 'Classic page',
};

export const KIND_ORDER = [
  'sql',
  'php',
  'html',
  'css',
  'javascript',
  'java',
  'image',
  'document',
  'capture',
];

export function formatBytes(n) {
  if (!n && n !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = n;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${i > 0 && value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export async function sha256(file) {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export const WAYBACK_LATEST = 'https://web.archive.org/web/2/';