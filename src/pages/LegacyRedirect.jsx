import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { sharpenerPath } from '@/lib/slugs';

// Forwards addresses from the original PHP site (stropper.com/home/*.php) to
// their new pages, so old bookmarks, forum links and search results keep working
// once the domain points at the new archive.
//
//   /home/stropper_view_details.php?id=1765  ->  /sharpener/1-2-3-lightning-1765
//   /home/stropper_list3_mobile.php          ->  /list
//   /home/stropper_index_mobile.php?...      ->  /browse?...
//   …and the rest of the old pages below.

const PAGES = [
  [/^stropper_list/, '/list'],
  [/^stropper_index/, '/browse'],
  [/^stropper_collectors/, '/collectors'],
  [/^stropper_doubles/, '/collectors'],
  [/^stropper_view_links/, '/about'],
  [/^stropper_help/, '/about'],
  [/^stropper_contact/, '/about'],
  [/^stropper_login/, '/login'],
  [/^stropper_(pdf|report|book)/, '/book'],
  [/^stropper_count/, '/'],
];

// Old search form fields that mean the same thing on the new Browse page.
const CARRY = ['letter', 'country', 'type', 'rarity'];

function browseQuery(search) {
  const old = new URLSearchParams(search);
  const next = new URLSearchParams();
  for (const key of CARRY) {
    const v = old.get(key);
    if (v && v.toLowerCase() !== 'all') next.set(key, v);
  }
  const word = old.get('word') || old.get('search') || old.get('q');
  if (word) next.set('q', word);
  const member = old.get('member') || old.get('memberid') || old.get('lister_id');
  if (member) next.set('collector', member);
  const s = next.toString();
  return s ? `?${s}` : '';
}

export default function LegacyRedirect() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const go = (to) => !cancelled && navigate(to, { replace: true });
    const file = decodeURIComponent(pathname.split('/').pop() || '').toLowerCase();
    const params = new URLSearchParams(search);

    if (file.startsWith('stropper_view_details')) {
      const legacyId = Number(params.get('id'));
      const shortname = params.get('shortname') || '';
      const fallback = shortname ? `/browse?q=${encodeURIComponent(shortname)}` : '/browse';
      if (!legacyId) {
        go(fallback);
      } else {
        base44.entities.Sharpener.filter({ legacy_id: legacyId }, null, 1, 0, ['id', 'name', 'legacy_id'])
          .then((rows) => go(rows?.[0] ? sharpenerPath(rows[0]) : fallback))
          .catch(() => go(fallback));
      }
    } else {
      const match = PAGES.find(([re]) => re.test(file));
      const to = match ? match[1] : '/';
      go(to === '/browse' ? `/browse${browseQuery(search)}` : to);
    }
    return () => {
      cancelled = true;
    };
  }, [pathname, search, navigate]);

  return (
    <div className="archive-container py-24 text-center text-sm text-steel">
      Stropper.com has moved to a new home. Taking you to the right page…
    </div>
  );
}
