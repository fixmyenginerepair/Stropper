import HeroSection from '@/components/home/HeroSection';
import TypeGrid from '@/components/home/TypeGrid';
import RecentSharpeners from '@/components/home/RecentSharpeners';
import BookSection from '@/components/home/BookSection';
import JoinSection from '@/components/home/JoinSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <TypeGrid />
      <RecentSharpeners />
      <BookSection />
      <JoinSection />
    </>
  );
}