'use client';

import { useCart } from '@/context/CartContext';
import { getUpcomingEvents } from '@/lib/events';
import { useHydrated } from '@/lib/useHydrated';
import Button from './ui/Button';
import EventTicket from './ui/EventTicket';
import styles from './UpcomingEvents.module.css';

// Landing blueprint section 5: the next three markets on the mid-page dark band
// (components.css → .dark-band), synced from the admin events store.
export default function UpcomingEvents() {
  const { events } = useCart();
  const hydrated = useHydrated();
  // Date filtering only after hydration: the page is prerendered at build time.
  const upcoming = hydrated ? getUpcomingEvents(events) : [];
  const next = upcoming.slice(0, 3);

  if (next.length === 0) {
    return null;
  }

  return (
    <section className="v3-section" id="markets" aria-labelledby="markets-title">
      <div className="main-container">
        <div className={styles.band}>
          <header className={styles.header}>
            <span className={styles.eyebrow}>Markets &amp; events</span>
            <h2 id="markets-title" className={styles.title}>
              Come see the kettle
            </h2>
            <p className={styles.lede}>Pre-order for any market below and skip the line. Pickup is free.</p>
          </header>

          <div className={styles.grid}>
            {next.map((event) => (
              <EventTicket key={event.id} event={event} className={styles.ticket} />
            ))}
          </div>

          <div className={styles.footer}>
            <p>Want us at your event? We pop live for parties, schools and companies.</p>
            <div className={styles.links}>
              <Button href="/contact?subject=Event%20Booking" variant="kettle" size="sm">
                Book us
              </Button>
              <Button href="/events" variant="light" size="sm">
                Full schedule ({upcoming.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
