import { useEffect, useState } from 'react';
import { Check, GitCompare } from 'lucide-react';
import { COMPARE_MAX, onCompareChange, readCompare, toggleCompare } from '@/lib/compare';

export default function CompareButton({ sharpenerId }) {
  const [ids, setIds] = useState(readCompare);
  const [full, setFull] = useState(false);

  useEffect(() => onCompareChange(setIds), []);

  const added = ids.includes(sharpenerId);

  const onClick = () => {
    const result = toggleCompare(sharpenerId);
    setFull(result === null);
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={added}
        className={`flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors ${
          added
            ? 'border-oxblood bg-oxblood/5 text-oxblood'
            : 'border-ink/20 bg-white text-ink hover:border-oxblood hover:text-oxblood'
        }`}
      >
        {added ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
        {added ? 'In compare' : 'Compare'}
      </button>
      {full && !added && (
        <span className="mt-1 text-[12px] text-steel">
          You can compare up to {COMPARE_MAX} pieces. Remove one first.
        </span>
      )}
    </div>
  );
}
