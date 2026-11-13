import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { allFields } from '@/lib/adminConfig';

export const inputClass =
  'mt-1 h-10 w-full rounded-lg border border-hair bg-white px-3 text-sm text-ink focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood';
const areaClass =
  'mt-1 w-full rounded-lg border border-hair bg-white px-3 py-2 text-sm text-ink focus:border-oxblood focus:outline-none focus:ring-1 focus:ring-oxblood';
const labelClass = 'block text-[12px] font-medium text-steel';

// Record -> editable form values
function toForm(config, record) {
  const form = {};
  allFields(config).forEach((f) => {
    const v = record?.[f.key];
    if (f.kind === 'checkbox') form[f.key] = v === undefined ? Boolean(f.default) : Boolean(v);
    else if (f.kind === 'images') form[f.key] = Array.isArray(v) ? v : [];
    else if (f.kind === 'list') form[f.key] = Array.isArray(v) ? v.join('\n') : '';
    else if (f.kind === 'number') form[f.key] = v ?? '';
    else form[f.key] = v ?? (record ? '' : f.default ?? '');
  });
  return form;
}

// Form values -> record payload
function fromForm(config, form, original) {
  const out = {};
  allFields(config).forEach((f) => {
    const v = form[f.key];
    let next;
    if (f.kind === 'number') next = v === '' || v === null ? null : Number(v);
    else if (f.kind === 'list') next = String(v || '').split('\n').map((s) => s.trim()).filter(Boolean);
    else if (f.kind === 'images' || f.kind === 'checkbox') next = v;
    else next = typeof v === 'string' ? v.trim() : v;

    const empty = next === null || next === '' || next === undefined;
    if (!empty) out[f.key] = next;
    // Only clear a field that previously held a value; never send blanks for untouched fields
    else if (original && original[f.key] !== undefined && original[f.key] !== null && original[f.key] !== '') {
      out[f.key] = null;
    }
  });
  return out;
}

async function uploadFiles(files) {
  const urls = [];
  for (const file of files) {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    urls.push(file_url);
  }
  return urls;
}

function ImagesField({ value, onChange, single }) {
  const fileRef = useRef(null);
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const list = single ? (value ? [value] : []) : value;
  const emit = (next) => onChange(single ? next[next.length - 1] || '' : next);

  const addUrl = () => {
    const lines = url.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    if (!lines.length) return;
    emit([...list, ...lines]);
    setUrl('');
  };

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      emit([...list, ...(await uploadFiles(files))]);
    } catch (err) {
      alert(`Upload failed: ${err?.message || err}`);
    }
    setUploading(false);
    e.target.value = '';
  };

  const move = (i, d) => {
    const next = [...list];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    emit(next);
  };

  return (
    <div className="mt-1 space-y-3">
      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {list.map((src, i) => (
            <div key={`${src}-${i}`} className="group relative overflow-hidden rounded-lg border border-hair bg-frost">
              <img src={src} alt="" className="aspect-square w-full object-cover" />
              {i === 0 && !single && (
                <span className="absolute left-1 top-1 rounded bg-navy px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 p-1">
                {!single && (
                  <div className="flex gap-1">
                    <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1 text-steel hover:text-ink disabled:opacity-30" title="Move earlier"><ArrowUp className="h-3.5 w-3.5 -rotate-90" /></button>
                    <button type="button" disabled={i === list.length - 1} onClick={() => move(i, 1)} className="rounded p-1 text-steel hover:text-ink disabled:opacity-30" title="Move later"><ArrowDown className="h-3.5 w-3.5 -rotate-90" /></button>
                  </div>
                )}
                <button type="button" onClick={() => emit(list.filter((_, j) => j !== i))} className="ml-auto rounded p-1 text-oxblood hover:bg-oxblood/10" title="Remove photo"><X className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
          placeholder="Paste a photo URL"
          className={`${inputClass} mt-0 flex-1`}
        />
        <button type="button" onClick={addUrl} className="h-10 rounded-lg border border-hair bg-white px-4 text-sm font-medium text-ink hover:border-oxblood">Add URL</button>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-hair bg-white px-4 text-sm font-medium text-ink hover:border-oxblood disabled:opacity-60">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple={!single} hidden onChange={upload} />
      </div>
    </div>
  );
}

function RefField({ field, value, onChange }) {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    base44.entities[field.entity]
      .filter({}, 'name', 2000, 0, ['id', 'name'])
      .then((rows) => setOptions(rows || []))
      .catch(() => setOptions([]));
  }, [field.entity]);
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">None</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  );
}

function Field({ field, value, onChange }) {
  const label = `${field.label}${field.required ? ' *' : ''}`;
  if (field.kind === 'checkbox') {
    return (
      <label className="flex items-center gap-2 pt-6 text-[13px] text-ink">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#680000]" />
        {field.label}
      </label>
    );
  }
  let control;
  switch (field.kind) {
    case 'textarea':
    case 'list':
      control = <textarea rows={field.kind === 'list' ? 3 : 3} value={value} onChange={(e) => onChange(e.target.value)} className={areaClass} />;
      break;
    case 'markdown':
      control = <textarea rows={8} value={value} onChange={(e) => onChange(e.target.value)} className={`${areaClass} font-mono text-[13px]`} placeholder="Markdown supported" />;
      break;
    case 'select':
      control = (
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">Not recorded</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
      break;
    case 'ref':
      control = <RefField field={field} value={value} onChange={onChange} />;
      break;
    case 'images':
      control = <ImagesField value={value} onChange={onChange} />;
      break;
    case 'image':
      control = <ImagesField value={value} onChange={onChange} single />;
      break;
    default:
      control = (
        <input
          type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : field.kind === 'url' ? 'url' : 'text'}
          step={field.kind === 'number' ? 'any' : undefined}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
  }
  return (
    <div className={labelClass}>
      {label}
      {control}
    </div>
  );
}

/**
 * Add / edit dialog for any admin-managed record.
 * mode: 'create' | 'edit'. `record` may be a copy when duplicating.
 */
export default function RecordForm({ config, entityName, open, onOpenChange, record, mode, onSaved, onDelete }) {
  const [form, setForm] = useState(() => toForm(config, record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(toForm(config, record));
      setError('');
    }
  }, [open, record, config]);

  const set = (key, v) => setForm((prev) => ({ ...prev, [key]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const missing = allFields(config).filter((f) => f.required && !String(form[f.key] ?? '').trim());
    if (missing.length) {
      setError(`Please fill in: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = fromForm(config, form, mode === 'edit' ? record : null);
      const entity = base44.entities[entityName];
      const saved = mode === 'edit' && record?.id
        ? await entity.update(record.id, payload)
        : await entity.create(payload);
      await onSaved?.(saved || { ...record, ...payload });
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Could not save. Check that you are signed in as an admin.');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {mode === 'edit' ? `Edit ${config.singular}` : `Add ${config.singular}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-7">
          {config.sections.map((section) => (
            <fieldset key={section.title}>
              <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-oxblood">{section.title}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.fields.map((f) => (
                  <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
                    <Field field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}

          {error && <p className="rounded-lg bg-oxblood/10 px-3 py-2 text-sm text-oxblood">{error}</p>}

          <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center gap-3 border-t border-hair bg-white px-6 py-4">
            {mode === 'edit' && onDelete && (
              <button type="button" onClick={onDelete} className="flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-oxblood hover:bg-oxblood/10">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            )}
            <div className="ml-auto flex gap-3">
              <button type="button" onClick={() => onOpenChange(false)} className="h-11 rounded-lg border border-hair px-4 text-sm font-medium text-steel hover:text-ink">Cancel</button>
              <button type="submit" disabled={saving} className="h-11 rounded-lg bg-oxblood px-5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark disabled:opacity-60">
                {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : `Add ${config.singular}`}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
