import Hero from '@/components/Hero';
import TrustBanner from '@/components/TrustBanner';
import WaysToBuy from '@/components/WaysToBuy';
import FeaturedProducts from '@/components/FeaturedProducts';
import UpcomingEvents from '@/components/UpcomingEvents';
import FundraisingBand from '@/components/FundraisingBand';
import Story from '@/components/Story';
import Testimonials from '@/components/Testimonials';
import QuestionsBand from '@/components/QuestionsBand';

// Section order and content: wiki/design-system/landing-page-blueprint.html
// Goal: in five seconds a visitor knows what it is, how to get it, and when the next market is.
export default function Home() {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <Hero />
      <TrustBanner />
      <WaysToBuy />
      <FeaturedProducts />
      <UpcomingEvents />
      <FundraisingBand />
      <Story />
      <Testimonials />
      <QuestionsBand />
    </main>
  );
}
