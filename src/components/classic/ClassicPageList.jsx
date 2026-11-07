import { ExternalLink } from 'lucide-react';

export default function ClassicPageList({ pages }) {
  if (!pages.length) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {pages.map((page) => (
        <article key={page.id} className="rounded-[10px] border border-hair bg-white p-5">
          <h3 className="font-heading text-lg font-bold text-ink">{page.title}</h3>
          {page.description && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-steel">{page.description}</p>
          )}
          {page.path && (
            <p className="mt-3 break-all font-mono text-[11.5px] text-steel/70">{page.path}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] font-semibold">
            {page.external_url && (
              <a
                href={page.external_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-oxblood hover:underline"
              >
                Open live <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {page.capture_url && (
              <a
                href={page.capture_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-navy hover:underline"
              >
                Wayback copy <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}