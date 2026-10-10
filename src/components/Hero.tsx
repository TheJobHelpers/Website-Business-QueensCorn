'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { FREE_AZ_SHIPPING_THRESHOLD } from '@/lib/shop';
import { getUpcomingEvents, pickupLabel, weekdayLabel } from '@/lib/events';
import { useHydrated } from '@/lib/useHydrated';
import Button from './ui/Button';
import styles from './Hero.module.css';

// Landing blueprint section 1 (wiki/design-system/landing-page-blueprint.html#s1).
// Left: the promise and the ways to buy. Right: the food. A real close-up of the
// kettle corn on a warm glow, Reina at the kettle, and one flavor you can add in a tap.
const HERO_FLAVOR_ID = '6'; // Caramel & Cheddar: the mix in the close-up photo

export default function Hero() {
  const router = useRouter();
  const { events, products, selectPickupForEvent, addItem, openDrawer } = useCart();
  const hydrated = useHydrated();
  const [added, setAdded] = useState(false);

  // Date filtering only after hydration: the page is prerendered at build time.
  const nextPickup = hydrated ? getUpcomingEvents(events).find((e) => e.pickupAvailable) : undefined;
  const lowestPrice = Math.min(
    ...products.map((p) => parseFloat(p.price.replace(/[^0-9.]/g, '')) || Infinity)
  );
  const fromPrice = Number.isFinite(lowestPrice) ? `$${lowestPrice.toFixed(0)}` : '$6';
  const heroFlavor = products.find((p) => p.id === HERO_FLAVOR_ID);
  const town = nextPickup
    ? nextPickup.location.split(',').slice(-2, -1).join('').trim() || nextPickup.location
    : '';

  const preOrder = () => {
    if (!nextPickup) return;
    selectPickupForEvent(pickupLabel(nextPickup));
    router.push('/shop#flavor-grid');
  };

  const addHeroFlavor = () => {
    if (!heroFlavor) return;
    addItem(heroFlavor, 'Small (Individual)', 1);
    setAdded(true);
    openDrawer();
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <Image src="/bob-pouring-kernels.jpg" alt="" fill priority sizes="100vw" className={styles.bg} />
      <div className={styles.shade} aria-hidden="true" />

      <div className={`main-container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className={styles.badge}>Family-run in Arizona since 2017</span>
          <h1 id="hero-title" className={styles.title}>
            Hand-popped kettle corn, <em>fit for royalty.</em>
          </h1>
          <p className={styles.sub}>
            Sweet, salty and still warm from the kettle. Order online and pick it up free at the
            stand, or have it shipped to your door.
          </p>
          <div className={styles.actions}>
            <Button href="/shop" variant="red">
              Order now
            </Button>
            <Button href="#markets" variant="light">
              Find us this weekend
            </Button>
          </div>

          {nextPickup && (
            <div className={styles.pill}>
              <p>
                <span className={styles.when}>
                  Next pop-up · {weekdayLabel(nextPickup)}, {nextPickup.month}{' '}
                  {nextPickup.day.replace('-', '–')}
                </span>
                {nextPickup.title}
                {town ? `, ${town}` : ''}
              </p>
              <Button variant="kettle" size="sm" onClick={preOrder}>
                Pre-order
              </Button>
            </div>
          )}

          <ul className={styles.perks}>
            <li>Free pickup at every market</li>
            <li>Free AZ shipping over ${FREE_AZ_SHIPPING_THRESHOLD}</li>
            <li>From {fromPrice} a bag</li>
          </ul>
        </div>

        <div className={styles.visual}>
          <div className={styles.glow} aria-hidden="true" />
          <div className={styles.plate}>
            <Image
              src="/popcorn-scoop-fresh.jpg"
              alt="A heap of fresh caramel and cheddar kettle corn with a metal scoop"
              fill
              priority
              sizes="(max-width: 960px) 72vw, 460px"
              className={styles.plateImg}
            />
          </div>

          <figure className={styles.snapshot}>
            <div className={styles.snapshotPhoto}>
              <Image
                src="/reina-stirring-kettle.jpg"
                alt="Reina stirring the kettle with a long wooden paddle"
                fill
                priority
                sizes="(max-width: 520px) 120px, 180px"
                className={styles.snapshotImg}
              />
            </div>
            <figcaption>Stirred by hand at the stand</figcaption>
          </figure>

          <svg className={styles.sticker} viewBox="0 0 120 120" role="img" aria-label="Hand-popped in Arizona">
            <defs>
              <path id="hero-sticker-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
            </defs>
            <circle cx="60" cy="60" r="58" />
            <text>
              <textPath href="#hero-sticker-circle">HAND-POPPED · IN ARIZONA ·</textPath>
            </text>
            <text x="60" y="68" textAnchor="middle" className={styles.stickerStar}>
              ★
            </text>
          </svg>

          {heroFlavor && (
            <div className={styles.flavorCard}>
              <div>
                <span className={styles.flavorLabel}>In the photo</span>
                <span className={styles.flavorName}>{heroFlavor.name}</span>
                <span className={styles.flavorPrice}>from {fromPrice}</span>
              </div>
              <Button variant="kettle" size="sm" onClick={addHeroFlavor} aria-label={`Add ${heroFlavor.name} to bag`}>
                {added ? 'Added ✓' : '+ Add'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
