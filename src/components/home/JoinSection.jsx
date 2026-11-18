import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { SITE } from '@/lib/site';

const signIn = () => base44.auth.redirectToLogin(window.location.href);

export default function JoinSection() {
  return (
    <section className="archive-container py-12 sm:py-16 lg:py-20">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-[10px] border border-hair bg-white p-7">
          <p className="eyebrow text-oxblood">Collectors</p>
          <h2 className="mt-3 font-heading text-xl font-bold text-ink">Join the collectors</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-steel">
            Collector accounts and directory listings are set up by the site admins. If you would
            like to be listed, write to the webmaster with your name, country and what you collect.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 text-sm font-semibold">
            <button
              onClick={signIn}
              className="text-left text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
            >
              Collector sign in
            </button>
            <a
              href={`mailto:${SITE.webmaster}?subject=${encodeURIComponent('Collector listing request')}`}
              className="text-left text-ink underline decoration-ink/20 underline-offset-4 hover:text-oxblood hover:decoration-oxblood"
            >
              Ask to be listed
            </a>
          </div>
        </div>

        <div className="rounded-[10px] border border-hair bg-white p-7">
          <p className="eyebrow text-oxblood">Sister site</p>
          <h2 className="mt-3 font-heading text-xl font-bold text-ink">ShaveWorld.org</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-steel">
            Our sister site covers the razors and blades these sharpeners were built to serve.
          </p>
          <a
            href={SITE.sister}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 hover:decoration-oxblood"
          >
            Visit ShaveWorld.org
          </a>
        </div>
      </div>
    </section>
  );
}