import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { COLLECTION_TYPES } from '@/lib/collectors';

const field =
  'h-11 w-full rounded-lg border border-hair bg-white px-3 text-[14px] text-ink outline-none transition-colors focus:border-oxblood';
const labelClass = 'block text-[13px] font-medium text-ink';

const EMPTY = {
  name: '',
  country: '',
  collection_type: '',
  main_collection_size: '',
  sharpener_collection_size: '',
  email: '',
};

export default function JoinDirectoryForm() {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setError('');
    setSubmitting(true);

    // Empty optional answers are left out so the record stays clean.
    const payload = Object.entries(form).reduce((acc, [key, value]) => {
      const trimmed = String(value).trim();
      if (trimmed) acc[key] = trimmed;
      return acc;
    }, {});

    try {
      // A signed-in submission is linked to the collector's own account.
      const me = await base44.auth.me().catch(() => null);
      if (me?.id) payload.user_id = me.id;
      await base44.entities.Collector.create(payload);
      setDone(true);
      setForm(EMPTY);
    } catch (err) {
      setError('Sorry — your listing could not be saved. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-[10px] border border-hair bg-white p-6 sm:p-8">
      <h2 className="font-heading text-xl font-bold text-ink">Join the directory</h2>

      {done ? (
        <p className="mt-4 rounded-lg border border-hair bg-frost px-4 py-3 text-[15px] text-ink">
          Thanks — your listing will appear once it&rsquo;s approved.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="collector-name">
              Name
            </label>
            <input
              id="collector-name"
              value={form.name}
              onChange={set('name')}
              required
              className={`${field} mt-1.5`}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="collector-country">
              Country
            </label>
            <input
              id="collector-country"
              value={form.country}
              onChange={set('country')}
              className={`${field} mt-1.5`}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="collector-type">
              Type of main collection
            </label>
            <select
              id="collector-type"
              value={form.collection_type}
              onChange={set('collection_type')}
              className={`${field} mt-1.5`}
            >
              <option value="">Choose a type</option>
              {COLLECTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="collector-main-size">
              Size of main collection
            </label>
            <input
              id="collector-main-size"
              value={form.main_collection_size}
              onChange={set('main_collection_size')}
              placeholder="e.g. 500+"
              className={`${field} mt-1.5`}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="collector-sharpener-size">
              Size of sharpener collection
            </label>
            <input
              id="collector-sharpener-size"
              value={form.sharpener_collection_size}
              onChange={set('sharpener_collection_size')}
              placeholder="e.g. 120"
              className={`${field} mt-1.5`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="collector-email">
              E-mail
            </label>
            <input
              id="collector-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              className={`${field} mt-1.5`}
            />
            <p className="mt-1.5 text-[12px] text-steel">
              Your address is never shown. Enquiries reach you through the webmaster.
            </p>
          </div>

          {error && <p className="sm:col-span-2 text-[14px] text-oxblood">{error}</p>}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-oxblood px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Add my listing'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}