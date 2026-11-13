import { Mail } from 'lucide-react';
import { contactHref } from '@/lib/collectors';

function Fact({ label, children }) {
  return (
    <div className="flex flex-col gap-1 border-b border-hair py-3 sm:flex-row sm:gap-6 lg:flex-col lg:gap-1">
      <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-steel sm:w-36 lg:w-auto">
        {label}
      </dt>
      <dd className="text-[15px] text-ink">{children}</dd>
    </div>
  );
}

export default function CollectorFacts({ collector, total }) {
  const listed = collector.created_date
    ? new Date(collector.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : null;

  return (
    <div className="space-y-4">
      <dl className="border-t border-hair">
        <Fact label="Based in">{collector.country || 'Not recorded'}</Fact>
        <Fact label="Collection">{collector.collection_type || 'Not recorded'}</Fact>
        <Fact label="Main collection">
          {collector.main_collection_size ? `${collector.main_collection_size} pieces` : 'Not recorded'}
        </Fact>
        <Fact label="Sharpeners">
          {collector.sharpener_collection_size || (total ? `${total} catalogued` : 'Not recorded')}
        </Fact>
        <Fact label="Listed since">{listed || 'Not recorded'}</Fact>
        {collector.from_legacy_site && <Fact label="Origins">On the original Stropper.com</Fact>}
      </dl>

      <div className="rounded-[10px] border border-hair bg-white p-6">
        <h2 className="font-heading text-lg font-bold text-ink">Get in touch</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-steel">
          Collector email addresses stay private. Send a note to the webmaster and it will be passed
          on to {collector.name}.
        </p>
        <a
          href={contactHref(collector.name)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-oxblood px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-oxblood-dark"
        >
          <Mail className="h-4 w-4" /> Contact collector
        </a>
      </div>
    </div>
  );
}