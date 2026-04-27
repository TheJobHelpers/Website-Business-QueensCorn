import Image from 'next/image';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './StoryPage.module.css';

export default function StoryPage() {
  return (
    <main className={styles.storyPage}>
      
      <div className={styles.container}>
        {/* Editorial Header - No full bleed image */}
        <header className={styles.header}>
          <ScrollReveal>
            <span className={styles.label}>Our Legacy</span>
            <h1 className={styles.mainTitle}>A Journey Created One Kernel at a Time</h1>
          </ScrollReveal>
        </header>

        {/* Narrative Section 1 */}
        <section className={styles.narrativeSection}>
          <div className={styles.textBlock}>
            <ScrollReveal>
              <div className={styles.accentLine}></div>
              <p>
                The Queen&apos;s Corn was established in 2017 by husband-and-wife team 
                <strong> Bob and Reina Andersen</strong>. To be honest, we never dreamed 
                of popping kettle corn because we both work in the medical field.
              </p>
              <p>
                We were simply tired of buying bland kettle corn with no flavor at local events. 
                So, we decided to purchase our own equipment and make it ourselves. 
                The learning curve was tough—we burnt more corn than we sold in those early days—but 
                with persistence, we perfected the art of the perfect pop.
              </p>
            </ScrollReveal>
          </div>
          <ScrollReveal type="slide-left">
            <div className={styles.framedImage}>
              <Image 
                src="/our-story-team.webp" 
                alt="Bob and Reina" 
                fill 
                className={styles.img}
                sizes="(max-width: 1024px) 100vw, 500px"
              />
            </div>
          </ScrollReveal>
        </section>

        {/* Photo Journal Collage */}
        <section className={styles.journalSection}>
          <div className={styles.journalGrid}>
            
            <div className={styles.quoteBlock}>
              <ScrollReveal>
                <blockquote className={styles.quote}>
                  &ldquo;We use pure Corn oil, sugar, and salt. Details matter, and we will never 
                  change to a cheaper ingredient. Our bags are packed full, and our product 
                  is always made fresh.&rdquo;
                </blockquote>
                <span className={styles.label}>— Bob Andersen, Co-Founder</span>
              </ScrollReveal>
            </div>

            <ScrollReveal className={styles.itemLarge} delay={1}>
              <Image src="/story-paddle.png" alt="Hand stirring" fill className={styles.img} />
            </ScrollReveal>

            <ScrollReveal className={styles.itemSmall} delay={2}>
              <Image src="/variety-mix.png" alt="Flavors" fill className={styles.img} />
            </ScrollReveal>

            <ScrollReveal className={styles.itemMedium} delay={3}>
              <Image src="/story-market.png" alt="Market display" fill className={styles.img} />
            </ScrollReveal>

            <ScrollReveal className={styles.itemMedium} delay={4}>
              <Image src="/hero-v3.png" alt="Popcorn cravings" fill className={styles.img} />
            </ScrollReveal>

          </div>
        </section>

        {/* Closing Narrative */}
        <section className={styles.narrativeSection} style={{ marginTop: '10rem' }}>
          <ScrollReveal type="slide-right">
            <div className={styles.framedImage} style={{ boxShadow: '-20px 20px 0px var(--surface)' }}>
              <Image 
                src="/process-paddle.png" 
                alt="Our Process" 
                fill 
                className={styles.img}
              />
            </div>
          </ScrollReveal>
          <div className={styles.textBlock}>
            <ScrollReveal>
              <div className={styles.accentLine}></div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'white' }}>The Mission Continues</h2>
              <p>
                Today, we pop at local farmers&apos; markets and events across Phoenix, Payson, 
                and the East Valley. We are passionate about our product and enjoy our 
                customers tremendously.
              </p>
              <p>
                Reina and I always banter back and forth, and we usually get the customers to 
                join in because <strong>The Queen&apos;s Corn is a happy place</strong> where 
                smiles are created one kernel at a time.
              </p>
            </ScrollReveal>
          </div>
        </section>

      </div>
    </main>
  );
}
