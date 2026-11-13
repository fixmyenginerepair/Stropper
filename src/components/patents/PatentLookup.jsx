import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatGrantDate, patentLabel } from '@/lib/patents';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LIMIT = 25;

const fieldClass =
  'h-11 w-full rounded-lg border border-hair bg-white px-3 text-sm text-ink focus:border-oxblood focus:outline-none';

const labelClass = 'block text-[11px] font-semibold uppercase tracking-[0.14em] text-steel';

export default function PatentLookup() {
  const [inventor, setInventor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState({ rows: null, total: 0, error: '', term: '' });

  const clear = () => {
    setInventor('');
    setFrom('');
    setTo('');
    setResult({ rows: null, total: 0, error: '', term: '' });
  };

  const submit = async (event) => {
    event.preventDefault();
    const name = inventor.trim();
    const years = [from, to].map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
    if (!name && !years.length) {
      setResult({ rows: null, total: 0, error: 'Enter an inventor name, a grant year, or both.', term: '' });
      return;
    }

    const low = years.length ? Math.min(...years) : null;
    const high = years.length ? Math.max(...years) : null;

    const and = [];
    if (name) and.push({ inventors: { $regex: escapeRegex(name), $options: 'i' } });
    if (low) {
      and.push({
        $or: [
          { grant_date: { $gte: `${low}-01-01`, $lte: `${high}-12-31` } },
          { year: { $gte: low, $lte: high } },
        ],
      });
    }
    const query = { $and: and };

    setBusy(true);
    setResult({ rows: null, total: 0, error: '', term: '' });
    try {
      const [count, page] = await Promise.all([
        base44.entities.Patent.count(query),
        base44.entities.Patent.filter(query, 'year', LIMIT, 0),
      ]);
      setResult({ rows: page.items || [], total: count || 0, error: '', term: name });
    } catch {
      setResult({ rows: null, total: 0, error: 'That lookup could not be run. Please try again.', term: '' });
    } finally {
      setBusy(false);
    }
  };

  const searched = result.rows !== null;

  return (
    <section className="mt-9 rounded-[10px] border border-hair bg-white p-5 sm:p-7">
      <div className="max-w-2xl">
        <p className="eyebrow text-oxblood">Lookup tool</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-ink sm:text-2xl">
          Identify a piece by its inventor or date
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-steel">
          An older sharpener often carries only an inventor&apos;s name and a patent date. Enter
          what is stamped on the piece to find the patent, then open it to see the sharpeners in
          the collection that cite the same number.
        </p>
      </div>

      <form onSubmit={submit} className="mt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="lookup-inventor" className={labelClass}>
              Inventor name
            </label>
            <input
              id="lookup-inventor"
              value={inventor}
              onChange={(e) => setInventor(e.target.value)}
              placeholder="e.g. Kampfe"
              className={`mt-2 ${fieldClass}`}
            />
          </div>
          <div>
            <label htmlFor="lookup-from" className={labelClass}>
              Granted from
            </label>
            <input
              id="lookup-from"
              value={from}
              onChange={(e) => setFrom(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="1901"
              className={`mt-2 ${fieldClass}`}
            />
          </div>
          <div>
            <label htmlFor="lookup-to" className={labelClass}>
              Granted to
            </label>
            <input
              id="lookup-to"
              value={to}
              onChange={(e) => setTo(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="1910"
              className={`mt-2 ${fieldClass}`}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="flex h-11 items-center gap-2 rounded-lg bg-oxblood px-6 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {busy ? 'Looking up…' : 'Look up patents'}
          </button>
          {(inventor || from || to || searched) && (
            <button
              type="button"
              onClick={clear}
              className="text-[13px] font-medium text-steel underline decoration-steel/30 underline-offset-4 hover:text-oxblood"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {result.error && <p className="mt-4 text-[14px] text-oxblood">{result.error}</p>}

      {searched && !result.error && (
        <div className="mt-6 border-t border-hair pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[14px] text-ink">
              <span className="font-semibold">{result.total.toLocaleString()}</span>{' '}
              {result.total === 1 ? 'patent matches' : 'patents match'}
            </p>
            {result.total > LIMIT && (
              <p className="text-[13px] text-steel">
                Showing the first {LIMIT} — narrow the name or years to see more.
              </p>
            )}
          </div>

          {result.rows.length === 0 ? (
            <p className="mt-4 text-[14px] text-steel">
              Nothing matched. Check the spelling of the name, or widen the years.
            </p>
          ) : (
            <ul className="mt-2">
              {result.rows.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1 border-b border-hair py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <div className="min-w-0">
                    <Link
                      to={`/patents/${p.id}`}
                      className="font-heading text-[15px] font-bold leading-snug text-ink hover:text-oxblood"
                    >
                      {p.title || patentLabel(p)}
                    </Link>
                    <p className="mt-0.5 break-words text-[13px] text-steel">
                      {(p.inventors || []).join(', ') || 'Inventor not recorded'}
                      {p.assignees?.[0] ? ` · ${p.assignees[0]}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-[12.5px]">
                    <span className="font-mono text-oxblood">{patentLabel(p)}</span>
                    <span className="text-steel">{formatGrantDate(p)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}