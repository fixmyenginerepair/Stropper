import HeroSection from '@/components/home/HeroSection';
import ThroughTheDecades from '@/components/home/ThroughTheDecades';
import TypeGrid from '@/components/home/TypeGrid';
import RecentSharpeners from '@/components/home/RecentSharpeners';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import AdShowcase from '@/components/home/AdShowcase';
import JoinSection from '@/components/home/JoinSection';
import { Link } from 'react-router-dom';

function FoundOne() {
  return (
    <section className="archive-container pb-4">
      <div className="grid gap-px border border-ink/70 bg-ink/70 md:grid-cols-2">
        <Link to="/identify" className="group bg-paper p-7 transition-colors hover:bg-[#fbf6ea] sm:p-9">
          <p className="eyebrow text-oxblood">Found one in a drawer?</p>
          <h2 className="mt-2 font-heading text-[1.9rem] font-bold text-ink">Identify your sharpener</h2>
          <p className="mt-2 text-[16px] text-steel">A few quick questions show how it works and the pieces most like it.</p>
          <span className="mt-4 inline-block font-heading text-[16px] italic text-oxblood">Begin the inquiry →</span>
        </Link>
        <Link to="/most-wanted" className="group bg-paper p-7 transition-colors hover:bg-[#fbf6ea] sm:p-9">
          <p className="eyebrow text-oxblood">For collectors</p>
          <h2 className="mt-2 font-heading text-[1.9rem] font-bold text-ink">The most wanted</h2>
          <p className="mt-2 text-[16px] text-steel">The rarest pieces in the archive, as a checklist to tick off and print.</p>
          <span className="mt-4 inline-block font-heading text-[16px] italic text-oxblood">See the list →</span>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <ThroughTheDecades />
      <TypeGrid />
      <FoundOne />
      <RecentSharpeners />
      <FeaturedCarousel />
      <AdShowcase />
      <JoinSection />
    </>
  );
}
