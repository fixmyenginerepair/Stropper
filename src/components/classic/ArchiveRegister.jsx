import { Download } from 'lucide-react';
import { KIND_LABELS, KIND_ORDER, formatBytes } from '@/lib/archiveRegister';

function StatusChip({ archived }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide ${
        archived ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
      }`}
    >
      {archived ? 'Archived' : 'Awaiting file'}
    </span>
  );
}

export default function ArchiveRegister({ items, isAdmin, onAttach, onDownload }) {
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    rows: items.filter((item) => item.kind === kind),
  })).filter((group) => group.rows.length);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.kind} className="overflow-hidden rounded-[10px] border border-hair bg-white">
          <header className="flex items-baseline justify-between border-b border-hair px-5 py-3">
            <h3 className="font-heading text-[15px] font-bold text-ink">{KIND_LABELS[group.kind]}</h3>
            <span className="text-[12px] text-steel/70">
              {group.rows.filter((row) => row.file_uri).length} of {group.rows.length} archived
            </span>
          </header>
          <ul>
            {group.rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-3 border-b border-hair/70 px-5 py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[14.5px] font-semibold text-ink">{row.title}</p>
                    <StatusChip archived={Boolean(row.file_uri)} />
                  </div>
                  {row.path && (
                    <p className="mt-1 break-all font-mono text-[11.5px] text-steel/70">{row.path}</p>
                  )}
                  {row.description && (
                    <p className="mt-1 text-[13px] leading-relaxed text-steel">{row.description}</p>
                  )}
                  {row.checksum && (
                    <p className="mt-1 break-all font-mono text-[10.5px] text-steel/60">
                      SHA-256 {row.checksum.slice(0, 28)}…
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3 text-[13px] font-semibold">
                  {row.file_uri && (
                    <span className="text-steel/70">{formatBytes(row.bytes)}</span>
                  )}
                  {row.file_uri && (
                    <button
                      onClick={() => onDownload(row)}
                      className="inline-flex items-center gap-1.5 text-oxblood hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => onAttach(row)} className="text-navy hover:underline">
                      {row.file_uri ? 'Replace' : 'Attach file'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}