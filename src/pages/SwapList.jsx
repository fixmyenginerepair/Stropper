import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import SharpenerCard from '@/components/SharpenerCard';
import { SITE } from '@/lib/site';

export default function SwapList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Sharpener.filter({ is_double: true }, { sort: 'name', limit: 48 }).then(
      (page) => {
        setItems(page.items || []);
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="archive-container py-12 lg:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow text-oxblood">Doubles</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-ink sm:text-[2.6rem]">
          Swap list
        </h1>
        <p className="mt-3 text-[16px] text-steel">
          Sharpeners collectors have more than one of, and are willing to swap. Every entry is
          marked as a double in the archive.
        </p>
      </header>

      {loading ? (
        <p className="mt-9 text-sm text-steel">Loading the swap list…</p>
      ) : items.length === 0 ? (
        <div className="mt-9 rounded-[10px] border border-hair bg-white p-10 text-center">
          <h2 className="font-heading text-xl font-bold text-ink">Nothing on the list right now</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-steel">
            When collectors mark a sharpener as a double, it appears here. In the meantime, the
            webmaster can put you in touch with the right people.
          </p>
        </div>
      ) : (
        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {items.map((sharpener) => (
            <SharpenerCard key={sharpener.id} sharpener={sharpener} />
          ))}
        </div>
      )}

      <p className="mt-10 text-[14px] text-steel">
        Want to offer a swap?{' '}
        <a
          href={`mailto:${SITE.webmaster}?subject=Swap%20list`}
          className="font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
        >
          Contact the webmaster
        </a>
        .
      </p>
    </div>
  );
}