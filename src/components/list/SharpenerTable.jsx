import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { formatValue, sharpenerImage } from '@/lib/archive';

const th =
  'whitespace-nowrap border-b border-hair px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-steel';
const td = 'px-3 py-2 align-middle';

const listValue = (value) => {
  const formatted = formatValue(value);
  return formatted === 'Not recorded' ? '' : formatted;
};

// Desktop and tablet view of the full list.
export default function SharpenerTable({ items, loading, startIndex }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr className="bg-frost/70">
            <th className={`${th} w-14 text-right`}>#</th>
            <th className={th}>Description</th>
            <th className={th}>Country</th>
            <th className={th}>Type</th>
            <th className={th}>Rarity</th>
            <th className={`${th} text-right`}>Value</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-sm text-steel">
                Loading the list…
              </td>
            </tr>
          )}

          {!loading && items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-10 text-center text-sm text-steel">
                No sharpeners have been recorded yet.
              </td>
            </tr>
          )}

          {!loading &&
            items.map((item, index) => (
              <tr key={item.id} className="border-t border-hair/70 hover:bg-frost/50">
                <td className={`${td} text-right font-mono text-[12px] text-steel`}>
                  {startIndex + index + 1}
                </td>
                <td className={td}>
                  <Link
                    to={`/sharpener/${item.id}`}
                    className="flex items-center gap-3 text-ink transition-colors hover:text-oxblood"
                  >
                    <span className="h-10 w-10 shrink-0 overflow-hidden rounded border border-hair bg-frost">
                      <Image
                        src={sharpenerImage(item)}
                        alt={item.name || 'Sharpener'}
                        loading="lazy"
                        className="h-10 w-10 object-cover"
                      />
                    </span>
                    <span className="leading-snug">{item.description || item.name}</span>
                  </Link>
                </td>
                <td className={`${td} text-steel`}>{item.country || ''}</td>
                <td className={`${td} text-steel`}>{item.type || ''}</td>
                <td className={`${td} text-steel`}>{item.rarity || ''}</td>
                <td className={`${td} text-right text-ink`}>{listValue(item.value)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}