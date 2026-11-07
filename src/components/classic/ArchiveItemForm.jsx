import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { KIND_LABELS, KIND_ORDER, sha256 } from '@/lib/archiveRegister';

const field =
  'mt-1 w-full rounded-lg border border-hair bg-white px-3 py-2 text-[14px] text-ink outline-none focus:border-oxblood';

export default function ArchiveItemForm({ open, item, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    kind: item?.kind || 'php',
    path: item?.path || '',
    description: item?.description || '',
  });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      let payload = { ...form };
      if (file) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        payload = {
          ...payload,
          file_uri,
          file_name: file.name,
          bytes: file.size,
          checksum: await sha256(file),
          captured_date: new Date().toISOString().slice(0, 10),
        };
      }
      if (item) await base44.entities.ArchiveItem.update(item.id, payload);
      else await base44.entities.ArchiveItem.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'This entry could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            {item ? 'Attach the master copy' : 'Add to the archive'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-[12.5px] font-semibold text-steel">What it is</label>
            <input value={form.title} onChange={set('title')} required className={field} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[12.5px] font-semibold text-steel">Kind</label>
              <select value={form.kind} onChange={set('kind')} className={field}>
                {KIND_ORDER.map((kind) => (
                  <option key={kind} value={kind}>
                    {KIND_LABELS[kind]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-steel">Original path</label>
              <input value={form.path} onChange={set('path')} className={field} />
            </div>
          </div>

          <div>
            <label className="text-[12.5px] font-semibold text-steel">Note</label>
            <input value={form.description} onChange={set('description')} className={field} />
          </div>

          <div>
            <label className="text-[12.5px] font-semibold text-steel">The file</label>
            <input
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mt-1 w-full text-[13px] text-steel file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:text-[12.5px] file:font-semibold file:text-white"
            />
            <p className="mt-1 text-[11.5px] text-steel/70">
              Kept exactly as recovered, stored privately — nothing here is ever edited.
            </p>
          </div>

          {error && <p className="text-[13px] text-oxblood">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-hair px-4 py-2 text-[13.5px] font-semibold text-steel hover:border-steel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !form.title}
              className="rounded-lg bg-oxblood px-5 py-2 text-[13.5px] font-semibold text-white hover:bg-oxblood-dark disabled:opacity-50"
            >
              {busy ? 'Archiving…' : item ? 'Attach' : 'Add entry'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}