'use client';

import Image from 'next/image';
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
          <span>Premium Kettle Corn</span>
        </div>
        <h1 className={styles.title}>
          The Queen&apos;s Corn is a <br />
          <span className={styles.accent}>Happy Place</span>
        </h1>
        <p className={styles.description}>
          Creating smiles one kernel at a time. From our family to yours, 
          experience the handcrafted flavors that have made us Arizona&apos;s 
          favorite gourmet popcorn destination.
        </p>
        <div className={styles.actions}>
          <button className={`${styles.primaryBtn} shimmer-btn`}>Shop Our Flavors</button>
          <button className={styles.secondaryBtn}>See Us In Action</button>
        </div>
      </div>
      <div className={styles.scrollIndicator}>
        <span>Scroll to Explore</span>
        <div className={styles.line}></div>
      </div>
    </section>
  );
}
