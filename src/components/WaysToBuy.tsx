import { Truck, Store, School } from 'lucide-react';
import { FREE_AZ_SHIPPING_THRESHOLD, SHIPPING_AVAILABLE } from '@/lib/shop';
import Button from './ui/Button';
import styles from './WaysToBuy.module.css';

type Variant = 'red' | 'dark' | 'ghost';

interface Way {
  key: 'ship' | 'pickup' | 'group';
  step: string;
  badge?: string;
  icon: typeof Truck;
  title: string;
  text: string;
  fact: string;
  /** not open yet: shown with a "Coming soon" stamp and no action */
  soon?: boolean;
  actions: { label: string; href: string; variant: Variant }[];
}

const PICKUP: Way = {
  key: 'pickup',
  step: '1',
  badge: 'Most popular · Ready warm',
  icon: Store,
  title: 'Picked up at a market',
  text: 'Pre-order online, skip the line, and collect it warm from the stand.',
  fact: 'Pickup is always free',
  actions: SHIPPING_AVAILABLE
    ? [{ label: 'See market schedule', href: '#markets', variant: 'ghost' }]
    : [
        { label: 'Shop flavors', href: '/shop', variant: 'red' },
        { label: 'See market schedule', href: '#markets', variant: 'ghost' },
      ],
};

const GROUP: Way = {
  key: 'group',
  step: '2',
  badge: 'Schools & Events',
  icon: School,
  title: 'For your school or event',
  text: 'Raise money with a fundraiser, or book us to pop live at your party or company event.',
  fact: 'Fundraisers keep 50% of every sale',
  actions: [
    { label: 'Start a fundraiser', href: '/fundraising', variant: 'dark' },
    { label: 'Book an event', href: '/contact?subject=Event%20Booking', variant: 'ghost' },
  ],
};

const SHIP: Way = SHIPPING_AVAILABLE
  ? {
      key: 'ship',
      step: '3',
      icon: Truck,
      title: 'Shipped to your door',
      text: 'We pop it, bag it and send it anywhere in Arizona by USPS.',
      fact: `Free shipping on orders over $${FREE_AZ_SHIPPING_THRESHOLD}`,
      actions: [{ label: 'Shop flavors', href: '/shop', variant: 'red' }],
    }
  : {
      key: 'ship',
      step: '3',
      icon: Truck,
      title: 'Shipped to your door',
      text: 'Arizona shipping is on its way. Until then, pre-order for free pickup at any market.',
      fact: 'Not available yet',
      soon: true,
      actions: [],
    };

// Landing blueprint section 3: the three ways to buy, in the order people usually buy.
// While shipping is "coming soon" it moves to the end.
const WAYS: Way[] = SHIPPING_AVAILABLE ? [SHIP, PICKUP, GROUP] : [PICKUP, GROUP, SHIP];

export default function WaysToBuy() {
  return (
    <section className="v3-section" aria-labelledby="ways-title">
      <div className="main-container">
        <header className={styles.header}>
          <div className={styles.canopyStrip} aria-hidden="true" />
          <span className="v3-eyebrow">How it works</span>
          <h2 id="ways-title" className="v3-title">
            {SHIPPING_AVAILABLE ? 'Three ways to get your corn' : 'How to get your corn'}
          </h2>
          <p className="v3-lede">Every bag is popped fresh for your order.</p>
        </header>

        <ol className={`${styles.grid} fx-stagger`}>
          {WAYS.map(({ key, step, badge, icon: Icon, title, text, fact, soon, actions }) => (
            <li key={key} className={`${styles.card} ${styles[key]} ${soon ? styles.soon : ''}`}>
              <div className={styles.top}>
                <span className={styles.numDisc} aria-label={`Step ${step}`}>
                  {step}
                </span>
                {badge && !soon && (
                  <span className={styles.badge}>
                    <Icon size={15} strokeWidth={2.25} aria-hidden="true" />
                    {badge}
                  </span>
                )}
                {soon && (
                  <span className={styles.stamp}>
                    <Icon size={15} strokeWidth={2.25} aria-hidden="true" />
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.text}>{text}</p>
              {!soon && (
                <p className={styles.fact}>
                  <span className={styles.factDot} aria-hidden="true" />
                  {fact}
                </p>
              )}
              {actions.length > 0 && (
                <div className={styles.actions}>
                  {actions.map((a) => (
                    <Button key={a.label} href={a.href} variant={a.variant} size="sm">
                      {a.label}
                    </Button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
