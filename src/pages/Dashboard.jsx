import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ProfileForm from '@/components/dashboard/ProfileForm';
import MyPieces from '@/components/dashboard/MyPieces';

export default function Dashboard() {
  const [state, setState] = useState({ profile: null, pieces: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await base44.functions.invoke('collectorAccount', { action: 'load' });
      const data = res.data || {};
      setState({
        profile: data.profile || null,
        pieces: data.pieces || [],
        total: data.total || 0,
      });
    } catch {
      setError('Your dashboard could not be loaded. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const { profile, pieces, total } = state;

  const onSaved = (savedProfile) => {
    if (!savedProfile) return;
    const renamed = savedProfile.name !== profile?.name;
    setState((current) => ({ ...current, profile: savedProfile }));
    if (renamed) load();
  };

  return (
    <div className="pb-16">
      <header className="border-b border-hair bg-navy py-10 text-white sm:py-14">
        <div className="archive-container">
          <p className="eyebrow text-white/55">Private dashboard</p>
          <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight sm:text-[2.6rem]">
            {profile?.name || 'Your collector page'}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">
            Keep your directory details up to date and see every piece recorded under your name.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-[13px]">
            {profile?.approved ? (
              <Link
                to={`/collectors/${profile.id}`}
                className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                View your public listing
              </Link>
            ) : profile ? (
              <span className="rounded bg-white/10 px-2.5 py-1 text-white/80">
                Awaiting admin approval
              </span>
            ) : null}
            <Link
              to="/collectors"
              className="text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white"
            >
              Collectors directory
            </Link>
          </div>
        </div>
      </header>

      <div className="archive-container mt-10 grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div className="min-w-0">
          {error ? (
            <p className="rounded-[10px] border border-hair bg-white p-6 text-[15px] text-oxblood">
              {error}
            </p>
          ) : (
            <>
              {!loading && (
                <ProfileForm profile={profile} onSaved={onSaved} />
              )}
              <MyPieces
                name={profile?.name}
                pieces={pieces}
                total={total}
                loading={loading}
              />
            </>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-[10px] border border-hair bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-ink">How items are linked</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-steel">
              A sharpener appears here when the collector named in its &ldquo;Collection&rdquo;
              field matches your profile name exactly, so keep your name as it appears in the
              archive.
            </p>
          </div>
          <div className="rounded-[10px] border border-hair bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-ink">Found something missing?</h2>
            <p className="mt-2 text-[14px] leading-relaxed text-steel">
              Send photographs and what you know about a piece to the webmaster and it will be
              catalogued against your name.
            </p>
            <Link
              to="/about"
              className="mt-4 inline-block text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
            >
              Contact the webmaster
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}