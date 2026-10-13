import Hero from '@/components/Hero';
import TrustBanner from '@/components/TrustBanner';
import WaysToBuy from '@/components/WaysToBuy';
import FeaturedProducts from '@/components/FeaturedProducts';
import UpcomingEvents from '@/components/UpcomingEvents';
import FundraisingBand from '@/components/FundraisingBand';
import Story from '@/components/Story';
import Testimonials from '@/components/Testimonials';
import QuestionsBand from '@/components/QuestionsBand';
import ScrollReveal from '@/components/ScrollReveal';

// Section order and content: wiki/design-system/landing-page-blueprint.html
// Goal: in five seconds a visitor knows what it is, how to get it, and when the next market is.
// Sections below the first screen fade up once as they scroll into view.
export default function Home() {
  return (
    <main style={{ background: 'var(--paper)' }}>
      <Hero />
      <TrustBanner />
      {/* the popcorn comes first: flavors straight after the hero, then how to get them */}
      <ScrollReveal>
        <FeaturedProducts />
      </ScrollReveal>
      <ScrollReveal>
        <WaysToBuy />
      </ScrollReveal>
      <ScrollReveal>
        <UpcomingEvents />
      </ScrollReveal>
      <ScrollReveal>
        <FundraisingBand />
      </ScrollReveal>
      <ScrollReveal>
        <Story />
      </ScrollReveal>
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal>
        <QuestionsBand />
      </ScrollReveal>
    </main>
  );
}
