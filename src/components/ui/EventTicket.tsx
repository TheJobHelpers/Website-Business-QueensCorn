'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import type { EventItem } from '@/data/events';
import { pickupLabel, weekdayLabel } from '@/lib/events';
import Button from './Button';
import styles from './EventTicket.module.css';

// Design System v3.1: Event ticket (wiki/design-system/components.css → .ticket)
interface EventTicketProps {
  event: EventItem;
  eyebrow?: string;
  className?: string;
}

export default function EventTicket({ event, eyebrow, className }: EventTicketProps) {
  const router = useRouter();
  const { selectPickupForEvent, selectedPickupEvent, fulfillmentMethod } = useCart();
  const label = pickupLabel(event);
  const isSelected = fulfillmentMethod === 'pickup' && selectedPickupEvent === label;
  const town = event.location.split(',').slice(-2).join(',').trim();
  const isRange = /[-–]/.test(event.day);

  const handlePreOrder = () => {
    selectPickupForEvent(label);
    router.push('/shop#flavor-grid');
  };

  return (
    <article className={`${styles.ticket} ${className ?? ''}`}>
      <div className={styles.date} aria-label={`${event.month} ${event.day}, ${event.year}`}>
        <span className={styles.small}>{event.month}</span>
        <span className={`${styles.day} ${isRange ? styles.range : ''}`}>{event.day.replace('-', '–')}</span>
        <span className={styles.small}>{weekdayLabel(event)}</span>
      </div>
      <div className={styles.body}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.where}>
          {town} · {event.time}
        </p>
        <div className={styles.row}>
          {event.pickupAvailable ? (
            <Button variant="dark" size="sm" onClick={handlePreOrder}>
              {isSelected ? 'Pickup selected ✓' : 'Pre-order for pickup'}
            </Button>
          ) : (
            <span className={styles.walkup}>Walk-up sales only</span>
          )}
        </div>
      </div>
    </article>
  );
}
