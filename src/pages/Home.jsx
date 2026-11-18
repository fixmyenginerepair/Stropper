import HeroSection from '@/components/home/HeroSection';
import TypeGrid from '@/components/home/TypeGrid';
import RecentSharpeners from '@/components/home/RecentSharpeners';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import AdShowcase from '@/components/home/AdShowcase';
import JoinSection from '@/components/home/JoinSection';
import { Link } from 'react-router-dom';

function FoundOne() {
  return (
    <section className="archive-container pt-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/identify" className="group rounded-[12px] bg-navy p-6 text-white transition-colors hover:bg-navy/90 sm:p-7">
          <p className="eyebrow text-white/60">Found one in a drawer?</p>
          <h2 className="mt-2 font-heading text-2xl font-bold">Identify your sharpener</h2>
          <p className="mt-2 text-[15px] text-white/75">A few quick questions show how it works and similar pieces in the archive.</p>
          <span className="mt-4 inline-block text-sm font-semibold underline decoration-white/40 underline-offset-4 group-hover:decoration-white">Start →</span>
        </Link>
        <Link to="/most-wanted" className="group rounded-[12px] border border-hair bg-white p-6 transition-colors hover:border-oxblood sm:p-7">
          <p className="eyebrow text-oxblood">For collectors</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink">Most wanted</h2>
          <p className="mt-2 text-[15px] text-steel">The rarest pieces in the archive, as a checklist you can tick off and print.</p>
          <span className="mt-4 inline-block text-sm font-semibold text-oxblood underline decoration-oxblood/30 underline-offset-4 group-hover:decoration-oxblood">See the list →</span>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <FoundOne />
      <TypeGrid />
      <RecentSharpeners />
      <FeaturedCarousel />
      <AdShowcase />
      <JoinSection />
    </>
  );
}