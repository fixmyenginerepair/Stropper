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

const DEFAULT_OG_IMAGE = 'https://media.base44.com/images/public/6aef7ea3490a3928d32a4982/ca3cb62fc_stropper-og.jpg';

// Canonical address, share image, page URL and structured data (JSON-LD) for
// one record page. Returns a cleanup function that puts the site defaults back
// when the visitor moves on, so one page's tags never leak onto the next.
export function setRecordSeo({ url, image, imageAlt, jsonLd } = {}) {
  const added = [];
  try {
    if (url) {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
        added.push(link);
      }
      link.setAttribute('href', url);
      setTag('meta[property="og:url"]', 'property', 'og:url', url);
    }
    if (image) {
      setTag('meta[property="og:image"]', 'property', 'og:image', image);
      setTag('meta[name="twitter:image"]', 'name', 'twitter:image', image);
      if (imageAlt) setTag('meta[property="og:image:alt"]', 'property', 'og:image:alt', imageAlt);
    }
    for (const data of [].concat(jsonLd || [])) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-record-seo', '');
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      added.push(script);
    }
  } catch {
    /* ignore */
  }
  return () => {
    try {
      added.forEach((el) => el.remove());
      document.head.querySelector('link[rel="canonical"]')?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
      if (image) {
        setTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_OG_IMAGE);
        setTag('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_OG_IMAGE);
      }
    } catch {
      /* ignore */
    }
  };
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
