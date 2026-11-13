import ReactMarkdown from 'react-markdown';

// Renders article/maker text. Images written as ![alt](src "caption") become captioned figures.
const components = {
  h2: ({ children }) => (
    <h2 className="mt-12 font-heading text-[1.5rem] font-bold leading-snug text-ink sm:text-[1.7rem]">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 font-heading text-xl font-bold text-ink">{children}</h3>,
  p: ({ node, children }) => {
    // A paragraph holding only an image renders as a <figure>, which can't sit inside <p>.
    const onlyImage = node?.children?.length === 1 && node.children[0].tagName === 'img';
    if (onlyImage) return <>{children}</>;
    return <p className="mt-5 text-[16.5px] leading-[1.75] text-ink/85">{children}</p>;
  },
  a: ({ href, children }) => (
    <a href={href} className="text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood" target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="text-steel">{children}</em>,
  ul: ({ children }) => <ul className="mt-5 list-disc space-y-2 pl-6 text-[16px] text-ink/85">{children}</ul>,
  ol: ({ children }) => <ol className="mt-5 list-decimal space-y-2 pl-6 text-[16px] text-ink/85">{children}</ol>,
  img: ({ src, alt, title }) => (
    <figure className="my-9">
      <a href={src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[10px] border border-hair bg-white">
        <img src={src} alt={alt || ''} loading="lazy" className="mx-auto max-h-[680px] w-auto max-w-full object-contain" />
      </a>
      {title && <figcaption className="mt-2.5 text-[13px] leading-relaxed text-steel">{title}</figcaption>}
    </figure>
  ),
};

export default function Markdown({ children }) {
  if (!children) return null;
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}

// "Title — https://url" -> { label, url }
export function splitSource(source) {
  const match = /^(.*?)\s+[—-]\s+(https?:\/\/\S+)$/.exec(source || '');
  return match ? { label: match[1], url: match[2] } : { label: source, url: null };
}

export function SourceList({ sources }) {
  if (!sources?.length) return null;
  return (
    <section className="mt-14 border-t border-hair pt-6">
      <h2 className="eyebrow text-steel">Sources</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13.5px] leading-relaxed text-steel">
        {sources.map((s) => {
          const { label, url } = splitSource(s);
          return (
            <li key={s}>
              {url ? (
                <a href={url} target="_blank" rel="noreferrer" className="hover:text-oxblood hover:underline">{label}</a>
              ) : (
                label
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
