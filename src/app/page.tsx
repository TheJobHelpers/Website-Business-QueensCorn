import Hero from '@/components/Hero';
import Story from '@/components/Story';
import TrustBanner from '@/components/TrustBanner';
import FeaturedProducts from '@/components/FeaturedProducts';
import Process from '@/components/Process';
import Testimonials from '@/components/Testimonials';
import Marquee from '@/components/Marquee';
import UpcomingEvents from '@/components/UpcomingEvents';

export default function Home() {
  return (
    <main>
      <Hero />
      <TrustBanner />
      <FeaturedProducts />
      
      {/* Marquee as a high-end section divider */}
      <Marquee />
      
      {/* Dynamic Pop-Up Schedule synced from Admin DB */}
      <UpcomingEvents />
      
      <Process />
      <Testimonials />
      <Story />
    </main>
  );
}
