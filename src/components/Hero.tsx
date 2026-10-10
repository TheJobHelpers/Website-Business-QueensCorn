'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bgWrapper}>
        <div className={styles.imageBg} />
      </div>
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <span>Family-Owned Kettle Corn &bull; Handcrafted in Marana, AZ</span>
        </div>
        
        <h1 className={styles.title}>
          The Queen&apos;s Corn is a <br />
          <span className={styles.accent}>Happy Place</span>
        </h1>
        
        <p className={styles.description}>
          Creating smiles one kernel at a time. From our family to yours, 
          enjoy handcrafted kettle corn made fresh for Arizona’s markets, 
          events, and happy moments.
        </p>

        <div className={styles.flavorChips}>
          <span className={styles.chip}>Sweet &amp; Salty</span>
          <span className={styles.chip}>Jalapeño</span>
          <span className={styles.chip}>Caramel</span>
          <span className={styles.chip}>Cheddar</span>
          <span className={styles.chip}>Caramel Apple</span>
          <span className={styles.chip}>Seasonal</span>
        </div>

        <div className={styles.actions}>
          <Link href="/shop" className={`${styles.primaryBtn} shimmer-btn`}>
            <span>Shop Our Flavors</span>
            <ArrowRight size={17} />
          </Link>
          <Link href="/contact" className={styles.secondaryBtn}>
            <span>Book Us for Events</span>
          </Link>
        </div>

        <div className={styles.scrollIndicator}>
          <span>Scroll to Explore</span>
          <div className={styles.line} />
        </div>
      </div>
    </section>
  );
}
