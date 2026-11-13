import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const initials = (name) =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const displayName = (user) =>
  user?.full_name?.trim() || user?.email?.split('@')[0] || 'Collector';

const signInHref = () =>
  `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`;

export default function CommentsSection({ sharpenerId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth
      .me()
      .then((me) => setUser(me || null))
      .catch(() => setUser(null));
  }, []);

  const load = () =>
    base44.entities.Comment.filter(
      { sharpener_id: sharpenerId },
      { sort: '-created_date', limit: 100 }
    )
      .then((page) => setComments(page.items || []))
      .catch(() => setComments([]));

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [sharpenerId]);

  const submit = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || posting) return;
    setPosting(true);
    setError('');
    try {
      await base44.entities.Comment.create({
        sharpener_id: sharpenerId,
        body: text,
        author_name: displayName(user),
      });
      setBody('');
      await load();
    } catch {
      setError('Your comment could not be posted. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this comment? This cannot be undone.')) return;
    await base44.entities.Comment.delete(id);
    await load();
  };

  return (
    <section className="mt-14 border-t border-hair pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-2xl font-bold text-ink">
          Collector comments
        </h2>
        {!loading && (
          <span className="text-[13px] text-steel">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>

      {user ? (
        <form onSubmit={submit} className="mt-6 rounded-[10px] border border-hair bg-white p-5">
          <label
            htmlFor="comment-body"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-steel"
          >
            Commenting as {displayName(user)}
          </label>
          <textarea
            id="comment-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            maxLength={1500}
            placeholder="Share what you know about this piece…"
            className="mt-2 w-full rounded-lg border border-hair bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-steel/80 focus:outline-none focus:ring-2 focus:ring-oxblood"
          />
          {error && <p className="mt-2 text-[13px] font-medium text-oxblood">{error}</p>}
          <div className="mt-3 flex items-center justify-end">
            <button
              type="submit"
              disabled={posting || !body.trim()}
              className="rounded-lg bg-oxblood px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 rounded-[10px] border border-hair bg-white p-5">
          <p className="text-[15px] leading-relaxed text-ink/80">
            Sign in to join the discussion. Comments are tied to your collector account.
          </p>
          <a
            href={signInHref()}
            className="mt-3 inline-block rounded-lg bg-oxblood px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark"
          >
            Sign in to comment
          </a>
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-3">
          <div className="h-20 animate-pulse rounded-[10px] bg-white" />
          <div className="h-20 animate-pulse rounded-[10px] bg-white" />
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-[15px] text-steel">
          No comments yet. Be the first to add what you know about this sharpener.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {comments.map((comment) => {
            const name = comment.author_name || 'Collector';
            const mine = user && comment.created_by_id === user.id;
            return (
              <li key={comment.id} className="rounded-[10px] border border-hair bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-[12px] font-semibold text-white">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="text-[14px] font-semibold text-ink">{name}</p>
                      {(mine || user?.role === 'admin') && (
                        <span className="rounded-full bg-oxblood/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-oxblood">
                          {mine ? 'You' : 'Owner'}
                        </span>
                      )}
                      <span className="text-[12px] text-steel">
                        {formatDate(comment.created_date)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line break-words text-[15px] leading-relaxed text-ink/85">
                      {comment.body}
                    </p>
                  </div>
                  {(mine || user?.role === 'admin') && (
                    <button
                      onClick={() => remove(comment.id)}
                      className="rounded-md p-1.5 text-steel transition-colors hover:bg-oxblood/10 hover:text-oxblood"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}