// The visitor's compare list: up to four sharpeners, kept in this browser.
// Changes are broadcast so the tray and buttons stay in step across the page.

const KEY = 'stropper.compare';
const EVENT = 'stropper:compare';
export const COMPARE_MAX = 4;

export function readCompare() {
  try {
    const ids = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(ids) ? ids.filter((x) => typeof x === 'string').slice(0, COMPARE_MAX) : [];
  } catch {
    return [];
  }
}

function write(ids) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(0, COMPARE_MAX)));
  } catch {
    /* storage unavailable — the list lasts for this page only */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: ids }));
}

export function toggleCompare(id) {
  const ids = readCompare();
  if (ids.includes(id)) {
    write(ids.filter((x) => x !== id));
    return false;
  }
  if (ids.length >= COMPARE_MAX) return null; // full
  write([...ids, id]);
  return true;
}

export function removeFromCompare(id) {
  write(readCompare().filter((x) => x !== id));
}

export function clearCompare() {
  write([]);
}

export function compareHref(ids = readCompare()) {
  return ids.length ? `/compare?ids=${ids.join(',')}` : '/compare';
}

export function onCompareChange(fn) {
  const handler = () => fn(readCompare());
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
