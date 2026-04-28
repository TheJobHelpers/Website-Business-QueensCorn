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
                src="/process-paddle-real.png" 
                alt="Traditional wooden paddle stirring kettle corn" 
                fill 
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
              />
            </div>
          </ScrollReveal>
          <ScrollReveal type="slide-left" className={styles.content}>
            <h2 className={styles.subtitle}>The Method</h2>
            <h3 className={styles.title}>The Artisanal Standard</h3>
            <p className={styles.description}>
              Frustrated by tasteless, machine-made popcorn, we returned to the roots. 
              No mass-production, just a hickory wooden paddle and small-batch dedication.
            </p>
            <div className={styles.feature}>
              <span className={styles.dot}></span>
              <span>The Hand-Stir</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Section 2: Who We Are - Emotional Storytelling */}
        <div className={`${styles.row} ${styles.reverse}`}>
          <ScrollReveal type="slide-left" className={styles.imageContainer}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src="/variety-mix-real.png" 
                alt="Variety of flavored kettle corn" 
                fill 
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
              />
            </div>
          </ScrollReveal>
          <ScrollReveal type="slide-right" className={styles.content}>
            <h2 className={styles.subtitle}>Our Heart</h2>
            <h3 className={styles.title}>Born from a Mission of Joy</h3>
            <p className={styles.description}>
              It started at a local festival where the popcorn was cold and the smiles were missing. 
              Bob and Reina, both with medical backgrounds, knew there was a better way to nourish the soul. 
              We traded our stethoscopes for hickory paddles because we believe that a single bag of 
              perfect kettle corn can turn any day into a &ldquo;Happy Place.&rdquo;
            </p>
            <div className={styles.feature}>
              <span className={styles.dot}></span>
              <span>Crafted by Bob & Reina</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Section 3: The Production */}
        <div className={styles.row}>
          <ScrollReveal type="slide-right" className={styles.imageContainer}>
            <div className={`${styles.imageWrapper} img-wrapper-treatment`}>
              <Image 
                src="/detail-kernels-real.png" 
                alt="Production Detail" 
                fill 
                sizes="(max-width: 968px) 100vw, 50vw"
                className={`${styles.image} img-treatment`}
              />
            </div>
          </ScrollReveal>
          <ScrollReveal type="slide-left" className={styles.content}>
            <h2 className={styles.subtitle}>The Base</h2>
            <h3 className={styles.title}>The Purest Ingredients</h3>
            <p className={styles.description}>
              We refuse to use cheap oil blends. Our process starts with 100% pure Corn Oil, 
              ensuring a clean, buttery finish for every single kernel.
            </p>
            <div className={styles.feature}>
              <span className={styles.dot}></span>
              <span>Premium Base</span>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </section>
  );
}
