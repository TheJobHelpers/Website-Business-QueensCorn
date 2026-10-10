'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { EventItem } from '@/data/events';
import ScrollReveal from './ScrollReveal';
import styles from './UpcomingEvents.module.css';

export default function UpcomingEvents() {
  const router = useRouter();
  const { events, selectPickupForEvent, selectedPickupEvent, fulfillmentMethod } = useCart();

  // Show top 3 upcoming events on the homepage
  const displayEvents = events.slice(0, 3);

  const handlePreOrderPickup = (event: EventItem) => {
    const label = `${event.title} (${event.month} ${event.day})`;
    selectPickupForEvent(label);
    router.push('/shop#flavor-grid');
  };

  if (!displayEvents || displayEvents.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} id="upcoming-events">
      <div className="main-container">
        <ScrollReveal>
          <div className={styles.header}>
            <span className={styles.label}>
              <Calendar size={14} /> Arizona Pop-Up Schedule
            </span>
            <h2 className={styles.title}>Where to Find Us</h2>
            <p className={styles.subtitle}>
              Visit our kettle stand across the Valley or pre-order online for free market pickup. Managed live from our kitchen schedule.
            </p>
          </div>
        </ScrollReveal>

        <div className={styles.grid}>
          {displayEvents.map((event, index) => {
            const label = `${event.title} (${event.month} ${event.day})`;
            const isSelectedPickup =
              fulfillmentMethod === 'pickup' && selectedPickupEvent === label;

            return (
              <ScrollReveal key={event.id} delay={index + 1}>
                <div className={styles.eventCard}>
                  <div>
                    <div className={styles.cardTop}>
                      <div className={styles.dateBadge}>
                        <span className={styles.dateMonth}>{event.month}</span>
                        <span className={styles.dateDay}>{event.day}</span>
                        <span className={styles.dateYear}>{event.year}</span>
                      </div>
                      <div className={styles.eventMeta}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className={styles.badgeLive}>
                            <span className={styles.liveDot} /> Confirmed Pop-up
                          </span>
                        </div>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        <p className={styles.eventDesc}>{event.desc}</p>
                      </div>
                    </div>

                    <div className={styles.cardDetails}>
                      <div className={styles.detailRow}>
                        <Clock size={15} className={styles.detailIcon} />
                        <span>{event.time}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <MapPin size={15} className={styles.detailIcon} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    {event.pickupAvailable ? (
                      <button
                        type="button"
                        onClick={() => handlePreOrderPickup(event)}
                        className={`${styles.pickupBtn} ${isSelectedPickup ? styles.pickupBtnSelected : ''}`}
                      >
                        {isSelectedPickup ? (
                          <>
                            <CheckCircle size={16} /> Pickup Selected
                          </>
                        ) : (
                          <>Pre-Order Free Pickup</>
                        )}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Walk-up sales only</span>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={ displayEvents.length + 1 }>
          <div className={styles.footer}>
            <Link href="/events" className={styles.viewAllLink}>
              <Calendar size={18} />
              <span>View Full Calendar & Gallery ({events.length} Events)</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
