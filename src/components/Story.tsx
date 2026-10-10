import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import styles from './Story.module.css';
import ScrollReveal from './ScrollReveal';

export default function Story() {
  return (
    <section className={styles.storySection}>
      <div className="main-container">
        <div className={styles.grid}>
          <ScrollReveal type="slide-right" className={styles.imageContainer}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src="/bob-reina.webp" 
                alt="Bob and Reina Andersen - Founders of The Queen's Corn" 
                fill
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
                priority
              />
              <div className={styles.imageOverlay} />
            </div>
            <div className={styles.experienceBadge}>
              <span className={styles.badgeYear}>MARANA, AZ</span>
              <span className={styles.badgeText}>Hand-Popped Daily</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal type="slide-left" className={styles.content}>
            <span className={styles.subtitle}>
              <Heart size={14} style={{ display: 'inline', color: 'var(--primary)', verticalAlign: '-2px' }} /> Real People, Real Passion
            </span>
            <h2 className={styles.title}>Meet Bob &amp; Reina</h2>
            
            <p className={styles.description}>
              It started at a local Arizona festival where the popcorn was cold and the smiles were missing. 
              Bob and Reina, both with healthcare backgrounds, knew there was a better way to nourish the spirit. 
              They traded their stethoscopes for 8-foot hickory paddles because they believe a hot, fresh bag 
              of handcrafted kettle corn can turn any day into a &ldquo;Happy Place.&rdquo;
            </p>

            <blockquote className={styles.quote}>
              &ldquo;When you visit our kettle stand, you smell the caramelized sugar 200 feet away. 
              No factories, no chemical powders—just pure cane sugar, monster mushroom corn, and real love.&rdquo;
            </blockquote>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <strong className={styles.statNumber} style={{ color: 'var(--accent)' }}>100%</strong>
                <span className={styles.statLabel}>Hand-Stirred Batches</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <strong className={styles.statNumber} style={{ color: 'var(--primary)' }}>50%</strong>
                <span className={styles.statLabel}>School Giveback</span>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <strong className={styles.statNumber} style={{ color: '#4ADE80' }}>0</strong>
                <span className={styles.statLabel}>Artificial Preservatives</span>
              </div>
            </div>

            <Link href="/story" className={styles.storyBtn}>
              <span>Read Bob &amp; Reina&apos;s Full Story</span>
              <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
