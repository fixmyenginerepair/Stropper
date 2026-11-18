// Sets the browser title and the description tags for a record page,
// so each sharpener, maker, patent and article has its own wording.

function clean(text) {
  return String(text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_>`[\]()!]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function shorten(text, max = 158) {
  const t = clean(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${cut.slice(0, space > 80 ? space : cut.length).replace(/[,;:.\s]+$/, '')}…`;
}

function setTag(selector, attr, name, value) {
  try {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  } catch {
    /* ignore */
  }
}

export function setPageMeta(title, description) {
  if (title) {
    document.title = title;
    setTag('meta[property="og:title"]', 'property', 'og:title', title);
    setTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  }
  const d = shorten(description);
  if (d) {
    setTag('meta[name="description"]', 'name', 'description', d);
    setTag('meta[property="og:description"]', 'property', 'og:description', d);
    setTag('meta[name="twitter:description"]', 'name', 'twitter:description', d);
  }
}
