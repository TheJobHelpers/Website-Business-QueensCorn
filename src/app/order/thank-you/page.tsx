import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './ThankYou.module.css';

export const metadata: Metadata = {
  title: "Thank you | The Queen's Corn",
  description: 'Your order is in. Here is how market pickup works.',
  robots: { index: false, follow: false },
};

// Where shoppers land when they come back from Shopify's order confirmation (the Shopify theme
// sends them here). The page knows nothing about the order itself: the receipt is Shopify's.
const STEPS = [
  'Check your email for the receipt from Shopify',
  'Find our stand at the event you chose',
  'Give us your name and collect it warm',
];

export default function ThankYouPage() {
  return (
    <main className={styles.page}>
      <div className="main-container">
        <section className={`${styles.card} enter`} aria-labelledby="thanks-title">
          <span className={styles.badge} aria-hidden="true">
            <Check size={28} strokeWidth={2.5} />
          </span>
          <span className={styles.eyebrow}>Order received</span>
          <h1 id="thanks-title" className={styles.title}>
            Thank you. <em>See you at the market.</em>
          </h1>
          <p className={styles.lede}>
            We will pop your order fresh for pickup. Your receipt is on its way to your inbox.
          </p>

          <ol className={styles.steps} aria-label="What happens next">
            {STEPS.map((step, i) => (
              <li key={step}>
                <span className={styles.stepNo}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>

          <div className={styles.actions}>
            <Button href="/events" variant="dark">
              See where to find us
            </Button>
            <Button href="/shop" variant="ghost">
              Keep shopping
            </Button>
          </div>

          <p className={styles.help}>
            Something not right with your order? <Link href="/contact?subject=Market%20Pickup%20Order">Send us a message</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
