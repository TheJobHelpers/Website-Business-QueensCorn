import Image from 'next/image';
import ScrollReveal from './ScrollReveal';
import styles from './Process.module.css';

export default function Process() {
  return (
    <section id="process" className={styles.processSection}>
      <div className="main-container">
        
        {/* Section 1: The Artisanal Standard */}
        <div className={styles.row}>
          <ScrollReveal type="slide-right" className={styles.imageContainer}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src="/bob-pouring-kernels.jpg" 
                alt="Bob Andersen pouring fresh corn kernels into the kettle" 
                fill 
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
              />
              <div className={styles.photoBadge}>
                <span>Copper Kettle &bull; 400&deg;F Roar</span>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal type="slide-left" className={styles.content}>
            <span className={styles.stepNum}>01 / Method</span>
            <h2 className={styles.subtitle}>Handcrafted Dedication</h2>
            <h3 className={styles.title}>The Artisanal Standard</h3>
            <p className={styles.description}>
              Frustrated by tasteless, machine-made popcorn, we returned to the roots. 
              No mass-production, just an 8-foot hickory wooden paddle, continuous stirring, 
              and small-batch dedication in the Arizona heat.
            </p>
            <div className={styles.feature}>
              <span className={styles.dot}></span>
              <span>100% Hand-Stirred Daily</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Section 2: Who We Are - Emotional Storytelling */}
        <div className={`${styles.row} ${styles.reverse}`}>
          <ScrollReveal type="slide-left" className={styles.imageContainer}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src="/trailer-rainbow.jpg" 
                alt="The Queen's Corn catering trailer under an Arizona rainbow" 
                fill 
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
              />
              <div className={styles.photoBadge}>
                <span>Marana, AZ &bull; Catering Trailer</span>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal type="slide-right" className={styles.content}>
            <span className={styles.stepNum}>02 / Heart</span>
            <h2 className={styles.subtitle}>Our Calling</h2>
            <h3 className={styles.title}>Born from a Mission of Joy</h3>
            <p className={styles.description}>
              It started at a local festival where the popcorn was cold and the smiles were missing. 
              Bob and Reina, both with healthcare backgrounds, knew there was a better way to nourish the soul. 
              We traded our stethoscopes for hickory paddles because we believe that a single warm bag of 
              perfect kettle corn can turn any day into a &ldquo;Happy Place.&rdquo;
            </p>
            <div className={styles.feature}>
              <span className={styles.dot}></span>
              <span>Crafted by Bob &amp; Reina</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Section 3: The Production */}
        <div className={styles.row}>
          <ScrollReveal type="slide-right" className={styles.imageContainer}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src="/popcorn-scoop-fresh.jpg" 
                alt="Fresh Caramel and Cheddar kettle corn scooped from the cooling sifter" 
                fill 
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
              />
              <div className={styles.photoBadge}>
                <span>Monster Mushroom Kernels &bull; Fresh Batch</span>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal type="slide-left" className={styles.content}>
            <span className={styles.stepNum}>03 / Purity</span>
            <h2 className={styles.subtitle}>Pure Ingredients</h2>
            <h3 className={styles.title}>The Purest Ingredients</h3>
            <p className={styles.description}>
              We refuse to use cheap palm or hydrogenated oil blends. Our process starts with 100% pure Corn Oil, 
              real cane sugar, and giant mushroom corn—ensuring a clean, buttery crunch that never leaves a greasy aftertaste.
            </p>
            <div className={styles.feature}>
              <span className={styles.dot}></span>
              <span>Pure Corn Oil &bull; Non-GMO</span>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
