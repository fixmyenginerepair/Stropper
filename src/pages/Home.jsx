import HeroSection from '@/components/home/HeroSection';
import TypeGrid from '@/components/home/TypeGrid';
import RecentSharpeners from '@/components/home/RecentSharpeners';
import FeaturedCarousel from '@/components/home/FeaturedCarousel';
import AdShowcase from '@/components/home/AdShowcase';
import JoinSection from '@/components/home/JoinSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TypeGrid />
      <RecentSharpeners />
      <FeaturedCarousel />
      <AdShowcase />
      <JoinSection />
    </>
  );
}