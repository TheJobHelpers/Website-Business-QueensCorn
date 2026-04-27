import Image from 'next/image';
import Link from 'next/link';
import styles from './Story.module.css';
import ScrollReveal from './ScrollReveal';

export default function Story() {
  return (
    <section className={styles.storySection}>
      <div className="main-container">
        <div className={styles.grid}>
          <ScrollReveal type="slide-right" className={styles.imageContainer}>
            <div className={styles.imageWrapper}>
              <Image 
                src="/bob-reina.webp" 
                alt="Bob and Reina - Founders of The Queen's Corn" 
                fill
                sizes="(max-width: 968px) 100vw, 50vw"
                className={styles.image}
              />
              <div className={styles.imageOverlay}></div>
            </div>
            <div className={styles.experienceBadge}>
              <span className={styles.badgeYear}>EST.</span>
              <span className={styles.badgeText}>Family Owned</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal type="slide-left" className={styles.content}>
            <h2 className={styles.subtitle}>Our Story</h2>
            <h3 className={styles.title}>Meet Bob and Reina</h3>
            <p className={styles.description}>
              The Queen&apos;s Corn is a happy place, creating smiles one kernel at a time. 
              As a family-owned kettle corn supplier in Arizona, we believe there&apos;s 
              never a dull moment when you&apos;re working together to bring joy to others.
            </p>
            <p className={styles.description}>
              What started as a passion for the perfect pop has grown into a legacy of 
              quality. From our jalapeno and regular kettle corn to our seasonal favorites, 
              every batch is crafted with the same love and care that Bob and Reina 
              put into the business every single day.
            </p>
            <div className={styles.quote}>
              &ldquo;The best kettle corn you can buy, period.&rdquo;
            </div>
            <Link href="/story" className={styles.storyBtn}>
              Read Our Full Story
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
