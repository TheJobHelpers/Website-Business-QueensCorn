'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ScrollReveal from '@/components/ScrollReveal';
import { UPCOMING_EVENTS, EventItem } from '@/data/events';
import { useCart } from '@/context/CartContext';
import styles from './EventsPage.module.css';

export default function EventsPage() {
  const router = useRouter();
  const { selectPickupForEvent, selectedPickupEvent, fulfillmentMethod } = useCart();

  const handlePreOrderPickup = (event: EventItem) => {
    const label = `${event.title} (${event.month} ${event.day})`;
    selectPickupForEvent(label);
    router.push('/shop#flavor-grid');
  };

  return (
    <main className={styles.page}>
      <div className="main-container">
        
        {/* Header */}
        <header className={styles.header}>
          <ScrollReveal>
            <span className={styles.label}>Where to find us</span>
            <h1 className={styles.title}>Upcoming Events</h1>
            <p className={styles.subtitle}>
              Visit our kettle stand across Arizona or pre-order online for free market pickup.
            </p>
          </ScrollReveal>
        </header>

        {/* Events List */}
        <div className={styles.eventsContainer}>
          {UPCOMING_EVENTS.map((event, i) => {
            const label = `${event.title} (${event.month} ${event.day})`;
            const isSelectedPickup =
              fulfillmentMethod === 'pickup' && selectedPickupEvent === label;

            return (
              <ScrollReveal key={event.id} delay={(i % 3) + 1} type={i % 2 === 0 ? 'slide-right' : 'slide-left'}>
                <div className={styles.eventCard}>
                  <div className={styles.dateBlock}>
                    <span className={styles.month}>{event.month}</span>
                    <span className={styles.day}>{event.day}</span>
                    <span className={styles.year}>{event.year}</span>
                  </div>
                  
                  <div className={styles.infoBlock}>
                    <h3 className={styles.eventTitle}>{event.title}</h3>
                    <p className={styles.eventDesc}>{event.desc}</p>
                  </div>
                  
                  <div className={styles.locationBlock}>
                    <span className={styles.time}>{event.time}</span>
                    <span className={styles.address}>{event.location}</span>
                    {event.pickupAvailable && (
                      <button
                        type="button"
                        onClick={() => handlePreOrderPickup(event)}
                        className={styles.pickupBtn}
                      >
                        {isSelectedPickup ? '✓ Pickup Selected' : 'Pre-Order for Pickup'}
                      </button>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Photo Gallery */}
        <section className={styles.gallerySection}>
          <ScrollReveal>
            <div style={{ textAlign: 'center' }}>
              <span className={styles.label}>Captured Moments</span>
              <h2 className={styles.title}>Event Gallery</h2>
            </div>
          </ScrollReveal>

          <div className={styles.galleryGrid}>
            <ScrollReveal delay={1}>
              <div className={`${styles.galleryItem} img-wrapper-treatment`}>
                <Image src="/our-story-team.webp" alt="Event setup" fill className="object-cover img-treatment" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={2}>
              <div className={`${styles.galleryItem} img-wrapper-treatment`}>
                <Image src="/hero-market-real.png" alt="Market stand" fill className="object-cover img-treatment" />
              </div>
            </ScrollReveal>
            <ScrollReveal delay={3}>
              <div className={`${styles.galleryItem} img-wrapper-treatment`}>
                <Image src="/process-paddle-real.png" alt="Popping fresh" fill className="object-cover img-treatment" />
              </div>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </main>
  );
}
