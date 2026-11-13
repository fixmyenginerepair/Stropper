import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CollectorFacts from '@/components/collectors/CollectorFacts';
import CollectorPieces from '@/components/collectors/CollectorPieces';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function CollectorDetail() {
  const { id } = useParams();
  const [collector, setCollector] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [total, setTotal] = useState(0);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setCollector(null);
    setPieces([]);
    setTotal(0);
    setMissing(false);

    const load = async () => {
      let row;
      try {
        row = await base44.entities.Collector.get(id);
      } catch {
        if (!cancelled) setMissing(true);
        return;
      }

      // Unapproved listings are only visible to admins.
      if (!row.approved) {
        let isAdmin = false;
        try {
          const me = await base44.auth.me();
          isAdmin = me?.role === 'admin';
        } catch {
          isAdmin = false;
        }
        if (!isAdmin) {
          if (!cancelled) setMissing(true);
          return;
        }
      }

      if (cancelled) return;
      setCollector(row);
      document.title = `${row.name} · Collectors · Stropper.com`;

      const query = {
        collection: { $regex: `^${escapeRegex(row.name.trim())}$`, $options: 'i' },
      };
      const [count, rows] = await Promise.all([
        base44.entities.Sharpener.count(query),
        base44.entities.Sharpener.filter(query, 'name', 500),
      ]);
      if (cancelled) return;
      setTotal(count || 0);
      setPieces(rows || []);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!missing) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [missing]);

  if (missing) {
    return (
      <div className="archive-container py-24 text-center">
        <h1 className="font-heading text-2xl font-bold text-ink">This collector isn’t listed</h1>
        <Link to="/collectors" className="mt-4 inline-block text-sm font-semibold text-oxblood">
          Back to the collectors
        </Link>
      </div>
    );
  }

  if (!collector) {
    return (
      <div className="archive-container py-24">
        <div className="h-6 w-64 animate-pulse rounded bg-white" />
      </div>
    );
  }

  const line =
    [collector.country, collector.collection_type].filter(Boolean).join(' · ') || 'Collector record';

  return (
    <div className="pb-16">
      <header className="border-b border-hair bg-navy py-10 text-white sm:py-14">
        <div className="archive-container">
          <Link
            to="/collectors"
            className="inline-flex items-center gap-1 text-[13px] text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Collectors
          </Link>
          <p className="eyebrow mt-6 text-white/55">Collector</p>
          <h1 className="mt-3 break-words font-heading text-3xl font-bold leading-tight sm:text-[2.6rem]">
            {collector.name}
          </h1>
          <p className="mt-3 text-[15px] text-white/70">{line}</p>
          {!collector.approved && (
            <p className="mt-4 inline-block rounded bg-white/10 px-2.5 py-1 text-[12px] text-white/80">
              Awaiting approval — only visible to admins
            </p>
          )}
        </div>
      </header>

      <div className="archive-container mt-10 grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div className="min-w-0">
          <CollectorPieces name={collector.name} pieces={pieces} total={total} />
        </div>
        <aside>
          <CollectorFacts collector={collector} total={total} />
        </aside>
      </div>
    </div>
  );
}