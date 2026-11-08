import { Check, Trash2 } from 'lucide-react';

const th =
  'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-steel';
const td = 'px-3 py-3 align-middle';

const ApproveButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-lg bg-oxblood px-3 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-oxblood-dark"
  >
    <Check className="h-3.5 w-3.5" /> Approve
  </button>
);

const DeleteButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-lg border border-hair px-3 py-1.5 text-[13px] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
  >
    <Trash2 className="h-3.5 w-3.5" /> Delete
  </button>
);

export default function PendingApprovals({ pending, onApprove, onDelete }) {
  return (
    <section className="mt-12 rounded-[10px] border border-hair bg-white p-5 sm:p-8">
      <h2 className="font-heading text-xl font-bold text-ink">Pending approval</h2>
      <p className="mt-2 text-[14px] text-steel">
        Only you can see these. Approved listings move into the directory above.
      </p>

      {pending.length === 0 ? (
        <p className="mt-5 text-sm text-steel">Nothing is waiting for approval.</p>
      ) : (
        <>
          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] border-collapse text-[14px]">
              <thead>
                <tr className="bg-frost/70">
                  <th className={th}>Name</th>
                  <th className={th}>Country</th>
                  <th className={th}>Type of collection</th>
                  <th className={th}># Sharpeners</th>
                  <th className={th}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row) => (
                  <tr key={row.id} className="border-t border-hair/70">
                    <td className={`${td} font-medium text-ink`}>{row.name}</td>
                    <td className={`${td} text-steel`}>{row.country || '—'}</td>
                    <td className={`${td} text-steel`}>{row.collection_type || '—'}</td>
                    <td className={`${td} text-steel`}>{row.sharpener_collection_size || '—'}</td>
                    <td className={`${td} text-right`}>
                      <div className="flex justify-end gap-2">
                        <ApproveButton onClick={() => onApprove(row.id)} />
                        <DeleteButton onClick={() => onDelete(row.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-5 divide-y divide-hair/70 border-y border-hair md:hidden">
            {pending.map((row) => (
              <li key={row.id} className="py-4">
                <p className="font-heading text-[15px] font-bold leading-snug text-ink">
                  {row.name}
                </p>
                <p className="mt-0.5 text-[13px] text-steel">
                  {[row.country, row.collection_type].filter(Boolean).join(' · ') || '—'}
                </p>
                {row.sharpener_collection_size && (
                  <p className="mt-1 text-[12px] text-steel">
                    Sharpeners {row.sharpener_collection_size}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <ApproveButton onClick={() => onApprove(row.id)} />
                  <DeleteButton onClick={() => onDelete(row.id)} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}