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
            <div className={`${styles.framedImage} img-wrapper-treatment`}>
              <Image 
                src="/reina-stirring-kettle.jpg" 
                alt="Reina Andersen stirring the copper kettle with an 8-foot wooden paddle" 
                fill 
                className={`${styles.img} img-treatment`}
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

            <ScrollReveal className={`${styles.itemLarge} img-wrapper-treatment`} delay={1}>
              <Image src="/bob-pouring-kernels.jpg" alt="Bob pouring fresh corn kernels into the kettle" fill className={`${styles.img} img-treatment`} />
            </ScrollReveal>

            <ScrollReveal className={`${styles.itemSmall} img-wrapper-treatment`} delay={2}>
              <Image src="/trailer-rainbow.jpg" alt="The Queen's Corn trailer under an Arizona rainbow" fill className={`${styles.img} img-treatment`} />
            </ScrollReveal>

            <ScrollReveal className={`${styles.itemMedium} img-wrapper-treatment`} delay={3}>
              <Image src="/booth-palm-trees.jpg" alt="The Queen's Corn market stand under Arizona palm trees" fill className={`${styles.img} img-treatment`} />
            </ScrollReveal>

            <ScrollReveal className={`${styles.itemMedium} img-wrapper-treatment`} delay={4}>
              <Image src="/popcorn-scoop-fresh.jpg" alt="Freshly popped Caramel and Cheddar kettle corn" fill className={`${styles.img} img-treatment`} />
            </ScrollReveal>

          </div>
        </section>

        {/* Closing Narrative */}
        <section className={styles.narrativeSection} style={{ marginTop: '10rem' }}>
          <ScrollReveal type="slide-right">
            <div className={`${styles.framedImage} img-wrapper-treatment`} style={{ boxShadow: '-20px 20px 0px var(--surface)' }}>
              <Image 
                src="/bob-pouring-kernels.jpg" 
                alt="Bob Andersen popping kettle corn fresh on site" 
                fill 
                className={`${styles.img} img-treatment`}
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
