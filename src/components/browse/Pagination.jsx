import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const numbers = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  for (let n = start; n <= end; n += 1) numbers.push(n);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-10 items-center gap-1 rounded-lg border border-hair bg-white px-3 text-sm text-steel transition-colors hover:border-oxblood hover:text-oxblood disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </button>

      {numbers.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-10 min-w-10 rounded-lg border px-3 text-sm transition-colors ${
            n === page
              ? 'border-oxblood bg-oxblood text-white'
              : 'border-hair bg-white text-steel hover:border-oxblood hover:text-oxblood'
          }`}
        >
          {n}
        </button>
      ))}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-10 items-center gap-1 rounded-lg border border-hair bg-white px-3 text-sm text-steel transition-colors hover:border-oxblood hover:text-oxblood disabled:opacity-40"
      >
        Next <ChevronRight className="h-4 w-4" />
      </button>

      <Link to="/browse" className="sr-only">
        Browse the archive
      </Link>
    </nav>
  );
}