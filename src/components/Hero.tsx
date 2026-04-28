'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.bgWrapper}>
        <div className={styles.imageBg}></div>
      </div>
      <div className={styles.overlay}></div>
      
      {/* Royal Seal Watermark */}
      <div className={styles.sealWrapper}>
        <Image src="/royal-seal.png" alt="Royal Seal" width={300} height={300} className={styles.seal} />
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span>Family-Owned Kettle Corn</span>
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
          <span className={styles.chip}>Sweet & Salty</span>
          <span className={styles.chip}>Jalapeño</span>
          <span className={styles.chip}>Caramel</span>
          <span className={styles.chip}>Cheddar</span>
          <span className={styles.chip}>Caramel Apple</span>
          <span className={styles.chip}>Seasonal</span>
        </div>
        <div className={styles.actions}>
          <Link href="/shop">
            <button className={`${styles.primaryBtn} shimmer-btn`}>Shop Our Flavors</button>
          </Link>
          <Link href="/contact">
            <button className={styles.secondaryBtn}>Book Us for Events</button>
          </Link>
        </div>
      </div>
      <div className={styles.scrollIndicator}>
        <span>Scroll to Explore</span>
        <div className={styles.line}></div>
      </div>
    </section>
  );
}
