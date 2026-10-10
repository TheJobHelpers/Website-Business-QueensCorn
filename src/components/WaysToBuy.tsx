import { Truck, Store, School } from 'lucide-react';
import { FREE_AZ_SHIPPING_THRESHOLD } from '@/lib/shop';
import Button from './ui/Button';
import styles from './WaysToBuy.module.css';

// Landing blueprint section 3: the three ways to buy, in the order people usually buy.
const WAYS = [
  {
    key: 'ship',
    icon: Truck,
    title: 'Shipped to your door',
    text: 'We pop it, bag it and send it anywhere in Arizona by USPS.',
    fact: `Free shipping on orders over $${FREE_AZ_SHIPPING_THRESHOLD}`,
    actions: [{ label: 'Shop flavors', href: '/shop', variant: 'red' as const }],
  },
  {
    key: 'pickup',
    icon: Store,
    title: 'Picked up at a market',
    text: 'Pre-order online, skip the line, and collect it warm from the stand.',
    fact: 'Pickup is always free',
    actions: [{ label: 'See market schedule', href: '#markets', variant: 'ghost' as const }],
  },
  {
    key: 'group',
    icon: School,
    title: 'For your school or event',
    text: 'Raise money with a fundraiser, or book us to pop live at your party or company event.',
    fact: 'Fundraisers keep 50% of every sale',
    actions: [
      { label: 'Start a fundraiser', href: '/fundraising', variant: 'dark' as const },
      { label: 'Book an event', href: '/contact?subject=Event%20Booking', variant: 'ghost' as const },
    ],
  },
];

export default function WaysToBuy() {
  return (
    <section className="v3-section" aria-labelledby="ways-title">
      <div className="main-container">
        <header className={styles.header}>
          <span className="v3-eyebrow">How it works</span>
          <h2 id="ways-title" className="v3-title">
            Three ways to get your corn
          </h2>
          <p className="v3-lede">Every bag is popped fresh for your order.</p>
        </header>

        <ol className={styles.grid}>
          {WAYS.map(({ key, icon: Icon, title, text, fact, actions }) => (
            <li key={key} className={`${styles.card} ${styles[key]}`}>
              <span className={styles.icon} aria-hidden="true">
                <Icon size={26} strokeWidth={2.25} />
              </span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.text}>{text}</p>
              <p className={styles.fact}>{fact}</p>
              <div className={styles.actions}>
                {actions.map((a) => (
                  <Button key={a.label} href={a.href} variant={a.variant} size="sm">
                    {a.label}
                  </Button>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
