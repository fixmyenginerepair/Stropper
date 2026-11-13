import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Archive, BookOpen, Factory, LayoutDashboard, Lock, LogOut, Megaphone, Scissors, Users, UserCog,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import EntityManager from '@/components/admin/EntityManager';
import UsersPanel from '@/components/admin/UsersPanel';
import { ADMIN_ENTITIES } from '@/lib/adminConfig';
import { cached, limited } from '@/lib/limited';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'Sharpener', label: 'Sharpeners', icon: Scissors },
  { key: 'Maker', label: 'Makers', icon: Factory },
  { key: 'Article', label: 'Articles', icon: BookOpen },
  { key: 'PeriodAd', label: 'Period ads', icon: Megaphone },
  { key: 'Collector', label: 'Collectors', icon: Users },
  { key: 'ArchiveItem', label: 'Classic archive', icon: Archive },
  { key: 'users', label: 'Users & access', icon: UserCog },
];

function Overview({ goTo }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const S = base44.entities.Sharpener;
    const c = (key, fn) => cached(`stats:${key}`, fn, 30000);
    Promise.all([
      c('s', () => S.count({})),
      c('nophoto', () => S.count({ $or: [{ images: { $exists: false } }, { images: { $size: 0 } }] })).catch(() => null),
      c('doubles', () => S.count({ is_double: true })),
      c('makers', () => base44.entities.Maker.count({})),
      c('articles', () => base44.entities.Article.count({})),
      c('drafts', () => base44.entities.Article.count({ status: 'Draft' })),
      c('ads', () => base44.entities.PeriodAd.count({})),
      c('collectors', () => base44.entities.Collector.count({})),
      c('pending', () => base44.entities.Collector.count({ approved: { $ne: true } })),
      limited(() => S.filter({}, '-updated_date', 8)),
    ]).then(([sharpeners, noPhoto, doubles, makers, articles, drafts, ads, collectors, pending, latest]) => {
      setStats({ sharpeners, noPhoto, doubles, makers, articles, drafts, ads, collectors, pending });
      setRecent(latest || []);
    }).catch(() => setStats({}));
  }, []);

  const tile = (label, value, tab, note) => (
    <button onClick={() => goTo(tab)} className="rounded-[10px] border border-hair bg-white p-5 text-left transition-colors hover:border-oxblood">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold text-ink">{value ?? '…'}</p>
      {note && <p className="mt-1 text-[12.5px] text-oxblood">{note}</p>}
    </button>
  );

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tile('Sharpeners', stats?.sharpeners?.toLocaleString(), 'Sharpener',
          stats && [stats.noPhoto ? `${stats.noPhoto} without photos` : null, `${stats.doubles} on swap list`].filter(Boolean).join(' · '))}
        {tile('Makers', stats?.makers, 'Maker')}
        {tile('Articles', stats?.articles, 'Article', stats?.drafts ? `${stats.drafts} drafts` : null)}
        {tile('Period ads', stats?.ads, 'PeriodAd')}
        {tile('Collectors', stats?.collectors, 'Collector', stats?.pending ? `${stats.pending} awaiting approval` : null)}
        {tile('Users & access', 'Manage', 'users', 'Invite admins and collectors')}
      </div>

      <h2 className="mt-10 font-heading text-lg font-bold text-ink">Recently changed sharpeners</h2>
      <ul className="mt-3 divide-y divide-hair rounded-[10px] border border-hair bg-white">
        {recent.map((r) => (
          <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-[14px]">
            {r.images?.[0] ? <img src={r.images[0]} alt="" className="h-9 w-9 rounded border border-hair object-cover" /> : <span className="h-9 w-9 rounded border border-hair bg-frost" />}
            <Link to={`/sharpener/${r.id}`} className="flex-1 truncate text-ink hover:text-oxblood">{r.name}</Link>
            <span className="text-[12.5px] text-steel">{r.updated_date ? new Date(r.updated_date).toLocaleString() : ''}</span>
          </li>
        ))}
        {!recent.length && <li className="px-4 py-6 text-center text-steel">Loading…</li>}
      </ul>
    </div>
  );
}

export default function Admin() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [me, setMe] = useState(undefined); // undefined = checking, null = signed out
  const [, setTick] = useState(0);

  useEffect(() => {
    cached('me', () => base44.auth.me()).then(setMe).catch(() => setMe(null));
  }, []);

  const goTo = (key) => {
    const next = new URLSearchParams();
    if (key !== 'overview') next.set('tab', key);
    setParams(next);
  };

  if (me === undefined) {
    return <div className="archive-container py-24 text-center text-steel">Checking your access…</div>;
  }

  if (!me || me.role !== 'admin') {
    return (
      <div className="archive-container py-24">
        <div className="mx-auto max-w-md rounded-[10px] border border-hair bg-white p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-oxblood" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-ink">Collector backend</h1>
          <p className="mt-2 text-[15px] text-steel">
            {me ? 'Your account does not have admin access. Ask the site owner to make you an admin.' : 'Sign in with an admin account to manage the archive.'}
          </p>
          {me ? (
            <button onClick={() => base44.auth.logout('/')} className="mt-6 rounded-lg border border-hair px-5 py-2.5 text-sm font-semibold text-ink hover:border-oxblood">Sign out</button>
          ) : (
            <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="mt-6 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white">Collector sign in</button>
          )}
        </div>
      </div>
    );
  }

  const current = TABS.find((t) => t.key === tab) || TABS[0];
  const config = ADMIN_ENTITIES[current.key];

  return (
    <div className="archive-container py-8 lg:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-oxblood">Collector backend</p>
          <h1 className="mt-2 font-heading text-[1.9rem] font-bold leading-tight text-ink">{current.label}</h1>
        </div>
        <div className="flex items-center gap-3 text-[13px] text-steel">
          Signed in as <span className="font-medium text-ink">{me.full_name || me.email}</span>
          <button onClick={() => base44.auth.logout('/')} className="flex items-center gap-1 rounded-lg border border-hair bg-white px-3 py-1.5 font-medium text-ink hover:border-oxblood">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[210px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:self-start">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => goTo(key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                key === current.key ? 'bg-navy font-semibold text-white' : 'text-ink hover:bg-white'
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>

        <section className="min-w-0">
          {current.key === 'overview' && <Overview goTo={goTo} />}
          {current.key === 'users' && <UsersPanel me={me} />}
          {config && <EntityManager key={current.key} entityName={current.key} config={config} onChanged={() => setTick((t) => t + 1)} />}
        </section>
      </div>
    </div>
  );
}
