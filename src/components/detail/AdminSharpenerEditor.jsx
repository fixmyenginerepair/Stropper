import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SHARPENER_TYPES } from '@/lib/archive';

const initialForm = (sharpener) => ({
  name: sharpener.name || '',
  type: sharpener.type || '',
  country: sharpener.country || '',
  manufacturer: sharpener.manufacturer || '',
  patent: sharpener.patent || '',
  blade: sharpener.blade || '',
  comment: sharpener.comment || '',
  collection: sharpener.collection || '',
  legacy_id: sharpener.legacy_id ?? '',
  rarity: sharpener.rarity || '',
  value: sharpener.value ?? '',
  description: sharpener.description || '',
  images: (sharpener.images || []).join('\n'),
  is_double: Boolean(sharpener.is_double),
});

const inputClass =
  'mt-1 h-10 w-full rounded-lg border border-hair bg-white px-3 text-sm text-ink focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood';

export default function AdminSharpenerEditor({ sharpener, onSaved }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => initialForm(sharpener));
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const saved = await onSaved({
      ...form,
      value: form.value === '' ? null : Number(form.value),
      legacy_id: form.legacy_id === '' ? null : Number(form.legacy_id),
      images: form.images
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    });
    setSaving(false);
    if (saved) setOpen(false);
  };

  const field = (label, key, type = 'text') => (
    <label className="block text-[12px] font-medium text-steel">
      {label}
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        className={inputClass}
      />
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex h-11 items-center gap-2 rounded-lg border border-ink/20 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-oxblood hover:text-oxblood">
          <Pencil className="h-4 w-4" /> Edit entry
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit sharpener</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{field('Name', 'name')}</div>

          <label className="block text-[12px] font-medium text-steel">
            Type
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              className={inputClass}
            >
              <option value="">Not recorded</option>
              {SHARPENER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          {field('Country', 'country')}
          {field('Manufacturer', 'manufacturer')}
          {field('Patent', 'patent')}
          {field('Blade', 'blade')}
          {field('Collection (collector ID)', 'collection')}
          {field('Legacy ID (old site)', 'legacy_id')}

          <label className="block text-[12px] font-medium text-steel">
            Rarity
            <select
              value={form.rarity}
              onChange={(e) => set('rarity', e.target.value)}
              className={inputClass}
            >
              <option value="">Not rated</option>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T'].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>

          {field('Estimated value ($)', 'value', 'number')}

          <div className="sm:col-span-2">
            <label className="block text-[12px] font-medium text-steel">
              Description
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm text-ink focus:border-oxblood focus:outline-none"
              />
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[12px] font-medium text-steel">
              Comment
              <textarea
                value={form.comment}
                onChange={(e) => set('comment', e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm text-ink focus:border-oxblood focus:outline-none"
              />
            </label>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[12px] font-medium text-steel">
              Image URLs (one per line)
              <textarea
                value={form.images}
                onChange={(e) => set('images', e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm text-ink focus:border-oxblood focus:outline-none"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[13px] text-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={form.is_double}
              onChange={(e) => set('is_double', e.target.checked)}
              className="h-4 w-4 accent-[#680000]"
            />
            Double — show on the swap list
          </label>

          <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 rounded-lg border border-hair px-4 text-sm font-medium text-steel hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-lg bg-oxblood px-5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}