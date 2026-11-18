import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GitCompare, X } from 'lucide-react';
import { clearCompare, compareHref, onCompareChange, readCompare } from '@/lib/compare';

// A small bar pinned to the bottom of the screen while the compare list has
// anything in it. Hidden on the compare page itself.
export default function CompareTray() {
  const [ids, setIds] = useState(readCompare);
  const { pathname } = useLocation();

  useEffect(() => onCompareChange(setIds), []);

  if (!ids.length || pathname.startsWith('/compare')) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-hair bg-white py-2 pl-4 pr-2 shadow-lg">
        <GitCompare className="h-4 w-4 text-oxblood" />
        <span className="text-sm text-ink">
          {ids.length} {ids.length === 1 ? 'piece' : 'pieces'} to compare
        </span>
        <Link
          to={compareHref(ids)}
          className="rounded-full bg-oxblood px-4 py-1.5 text-sm font-semibold text-white hover:bg-oxblood-dark"
        >
          {ids.length < 2 ? 'Open' : 'Compare'}
        </Link>
        <button
          type="button"
          onClick={clearCompare}
          aria-label="Clear compare list"
          className="rounded-full p-1.5 text-steel hover:bg-frost hover:text-oxblood"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
