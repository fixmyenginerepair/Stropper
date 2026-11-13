import { useEffect, useState } from 'react';
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

export default function ProfileForm({ profile, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: profile?.name || '',
      country: profile?.country || '',
      collection_type: profile?.collection_type || '',
      main_collection_size: profile?.main_collection_size || '',
      sharpener_collection_size: profile?.sharpener_collection_size || '',
      email: profile?.email || '',
    });
  }, [profile]);

  const set = (key) => (event) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = await base44.functions.invoke('collectorAccount', {
        action: 'save',
        profile: form,
      });
      setSaved(true);
      onSaved?.(res.data?.profile || null);
    } catch {
      setError('Your profile could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[10px] border border-hair bg-white p-6 sm:p-8">
      <h2 className="font-heading text-xl font-bold text-ink">
        {profile ? 'Your profile details' : 'Create your collector profile'}
      </h2>
      <p className="mt-2 text-[14px] leading-relaxed text-steel">
        {profile
          ? 'These details appear in the public collectors directory.'
          : 'Add your details to be listed in the collectors directory. New listings appear once an admin approves them.'}
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="dash-name">
            Name
          </label>
          <input
            id="dash-name"
            value={form.name}
            onChange={set('name')}
            required
            className={`${field} mt-1.5`}
          />
          <p className="mt-1.5 text-[12px] text-steel">
            Archive items are matched to you by this exact name.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="dash-country">
            Country
          </label>
          <input
            id="dash-country"
            value={form.country}
            onChange={set('country')}
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="dash-type">
            Type of main collection
          </label>
          <select
            id="dash-type"
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
          <label className={labelClass} htmlFor="dash-main-size">
            Size of main collection
          </label>
          <input
            id="dash-main-size"
            value={form.main_collection_size}
            onChange={set('main_collection_size')}
            placeholder="e.g. 500+"
            className={`${field} mt-1.5`}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="dash-sharpener-size">
            Size of sharpener collection
          </label>
          <input
            id="dash-sharpener-size"
            value={form.sharpener_collection_size}
            onChange={set('sharpener_collection_size')}
            placeholder="e.g. 120"
            className={`${field} mt-1.5`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="dash-email">
            E-mail
          </label>
          <input
            id="dash-email"
            type="email"
            value={form.email}
            onChange={set('email')}
            className={`${field} mt-1.5`}
          />
          <p className="mt-1.5 text-[12px] text-steel">
            Never shown publicly — enquiries reach you through the webmaster.
          </p>
        </div>

        {error && <p className="sm:col-span-2 text-[14px] text-oxblood">{error}</p>}

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-oxblood px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {saved && !saving && (
            <span className="text-[13px] font-medium text-steel">Saved</span>
          )}
        </div>
      </form>
    </section>
  );
}