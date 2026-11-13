// Keeps the admin backend inside Base44's rate limits
// (entity_list: 140 requests per 60s per signed-in user).
//  - at most MAX_CONCURRENT requests in flight
//  - at most MAX_PER_MINUTE requests started in any rolling minute
//  - automatic retry with back-off when Base44 still answers "Rate limit exceeded"

const MAX_CONCURRENT = 4;
const MAX_PER_MINUTE = 100; // stays well under the 140 cap, leaving room for the public pages
const MAX_RETRIES = 5;

let active = 0;
const waiting = [];
const started = []; // timestamps of recent starts

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pump() {
  const now = Date.now();
  while (started.length && now - started[0] > 60000) started.shift();
  while (active < MAX_CONCURRENT && waiting.length && started.length < MAX_PER_MINUTE) {
    const job = waiting.shift();
    active += 1;
    started.push(Date.now());
    job();
  }
  if (waiting.length && started.length >= MAX_PER_MINUTE) {
    setTimeout(pump, 60000 - (Date.now() - started[0]) + 50);
  }
}

function slot() {
  return new Promise((resolve) => {
    waiting.push(resolve);
    pump();
  });
}

function release() {
  active -= 1;
  pump();
}

const isRateLimit = (err) =>
  err?.status === 429 ||
  err?.response?.status === 429 ||
  /rate limit/i.test(err?.message || err?.data?.message || '');

const retryDelay = (err, attempt) => {
  const m = /retry after (\d+(?:\.\d+)?)s/i.exec(err?.message || err?.data?.message || '');
  const base = m ? Number(m[1]) * 1000 : 1000;
  return base * 2 ** attempt + Math.random() * 300;
};

/** Run one Base44 call through the limiter, retrying if rate-limited. */
export async function limited(fn) {
  for (let attempt = 0; ; attempt += 1) {
    await slot();
    try {
      return await fn();
    } catch (err) {
      if (!isRateLimit(err) || attempt >= MAX_RETRIES) throw err;
      await sleep(retryDelay(err, attempt));
    } finally {
      release();
    }
  }
}

/** Short-lived cache so the same lookup (e.g. who is signed in) isn't repeated on every page. */
const cache = new Map();
export function cached(key, fn, ttlMs = 60000) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.promise;
  const promise = limited(fn).catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { at: Date.now(), promise });
  return promise;
}
export const clearCache = (prefix = '') => {
  [...cache.keys()].forEach((k) => k.startsWith(prefix) && cache.delete(k));
};
