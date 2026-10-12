'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { EventItem } from '@/data/events';
import { useCart } from '@/context/CartContext';
import { getUpcomingEvents, pickupLabel, weekdayLabel } from '@/lib/events';
import { useHydrated } from '@/lib/useHydrated';
import styles from './EventsPage.module.css';

// Events page, design system v3.1. A compact header that explains pickup, then every upcoming
// event as a wide ticket (grouped by month) with its two actions: pre-order and directions.
const STEPS = ['Pick an event below', 'Order your flavors online', 'Collect it warm and skip the line'];

const PHOTOS = [
  { src: '/trailer-rainbow.jpg', alt: "The Queen's Corn trailer under an Arizona rainbow" },
  { src: '/booth-palm-trees.jpg', alt: "The Queen's Corn stand under Arizona palm trees" },
  { src: '/bob-pouring-kernels.jpg', alt: 'Bob pouring kernels into the kettle' },
  { src: '/reina-stirring-kettle.jpg', alt: 'Reina stirring the kettle by hand' },
];

const MONTH_NAMES: Record<string, string> = {
  jan: 'January', feb: 'February', mar: 'March', apr: 'April', may: 'May', jun: 'June',
  jul: 'July', aug: 'August', sep: 'September', oct: 'October', nov: 'November', dec: 'December',
};

const monthHeading = (event: EventItem) =>
  `${MONTH_NAMES[event.month.trim().slice(0, 3).toLowerCase()] ?? event.month} ${event.year}`;

const mapsUrl = (event: EventItem) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.title}, ${event.location}`)}`;

export default function EventsPage() {
  const router = useRouter();
  const { events, selectPickupForEvent, selectedPickupEvent, pickupChosen, fulfillmentMethod } = useCart();
  const hydrated = useHydrated();
  // Hide events that are already over. Date filtering only after hydration: the page is prerendered.
  const upcoming = hydrated ? getUpcomingEvents(events) : events;

  // Consecutive events of the same month share one heading.
  const months: { heading: string; events: EventItem[] }[] = [];
  for (const event of upcoming) {
    const heading = monthHeading(event);
    const last = months[months.length - 1];
    if (last?.heading === heading) last.events.push(event);
    else months.push({ heading, events: [event] });
  }

  const preOrder = (event: EventItem) => {
    selectPickupForEvent(pickupLabel(event));
    router.push('/shop#flavor-grid');
  };

  return (
    <main className={styles.page}>
      <div className="main-container">
        {/* Compact header: what this page is, and how pickup works */}
        <header className={`${styles.head} enter`}>
          <Image src="/booth-palm-trees.jpg" alt="" fill priority sizes="100vw" className={`${styles.headBg} fx-parallax`} />
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Events</span>
            <h1 className={styles.title}>
              Come see <em>the kettle.</em>
            </h1>
            <p className={styles.lede}>
              Find our stand at markets and festivals across Arizona. Walk up, or pre-order and pick it up free.
            </p>
          </div>
          <ol className={styles.steps} aria-label="How pickup works">
            {STEPS.map((step, i) => (
              <li key={step}>
                <span className={styles.stepNo}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </header>

        {/* Upcoming events, grouped by month */}
        {months.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>No events on the calendar right now</h2>
            <p>New dates are added as soon as they are confirmed. Want us at yours?</p>
            <Button href="/contact?subject=Event%20Booking" variant="dark" size="sm">
              Book us for an event
            </Button>
          </div>
        ) : (
          months.map((month) => (
            <section key={month.heading} className={styles.month} aria-label={month.heading}>
              <h2 className={styles.monthHeading}>
                {month.heading}
                <span>
                  {month.events.length} {month.events.length === 1 ? 'event' : 'events'}
                </span>
              </h2>
              <ul className={styles.list}>
                {month.events.map((event, i) => {
                  const isSelected =
                    pickupChosen && fulfillmentMethod === 'pickup' && selectedPickupEvent === pickupLabel(event);
                  const isRange = /[-–]/.test(event.day);

                  return (
                    <li key={event.id} className={`${styles.ticket} enter`} style={{ '--i': i + 1 } as CSSProperties}>
                      <div className={styles.date} aria-label={`${event.month} ${event.day}, ${event.year}`}>
                        <span className={styles.small}>{event.month}</span>
                        <span className={`${styles.day} ${isRange ? styles.range : ''}`}>
                          {event.day.replace('-', '–')}
                        </span>
                        <span className={styles.small}>{weekdayLabel(event)}</span>
                      </div>

                      <div className={styles.info}>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <p className={styles.desc}>{event.desc}</p>
                        <ul className={styles.meta}>
                          <li>
                            <Clock size={15} aria-hidden="true" />
                            {event.time}
                          </li>
                          <li>
                            <MapPin size={15} aria-hidden="true" />
                            {event.location}
                          </li>
                        </ul>
                      </div>

                      <div className={styles.actions}>
                        {event.pickupAvailable !== false ? (
                          <Button variant={isSelected ? 'kettle' : 'dark'} size="sm" onClick={() => preOrder(event)}>
                            {isSelected ? 'Pickup selected ✓' : 'Pre-order for pickup'}
                          </Button>
                        ) : (
                          <span className={styles.walkup}>Walk-up sales only</span>
                        )}
                        <a className={styles.directions} href={mapsUrl(event)} target="_blank" rel="noopener noreferrer">
                          Get directions
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}

        {/* Book the kettle */}
        <section className={`${styles.book} fx-zoom`} aria-labelledby="book-title">
          <div>
            <span className={styles.bookEyebrow}>Your event</span>
            <h2 id="book-title" className={styles.bookTitle}>
              Want the kettle at yours?
            </h2>
            <p>We pop live at school fairs, company parties, weddings and festivals across Arizona.</p>
          </div>
          <Button href="/contact?subject=Event%20Booking" variant="dark">
            Book us for an event
          </Button>
        </section>

        {/* From the stand */}
        <section className={`${styles.photos} fx-stagger`} aria-label="Photos from the stand">
          {PHOTOS.map((photo) => (
            <div key={photo.src} className={styles.photo}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 50vw, 25vw" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
