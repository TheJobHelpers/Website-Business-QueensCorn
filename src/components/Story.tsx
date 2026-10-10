import Image from 'next/image';
import Button from './ui/Button';
import styles from './Story.module.css';

// Landing blueprint section 7: the founders' story told once, in their own words (from /story),
// followed by the real three-step process. Replaces the old Process sections on the homepage.
const STEPS = [
  { src: '/bob-pouring-kernels.jpg', alt: 'Bob pouring kernels into the kettle', caption: 'Kernels into the kettle' },
  { src: '/reina-stirring-kettle.jpg', alt: 'Reina stirring the kettle with a long wooden paddle', caption: 'Stirred by hand, nonstop' },
  { src: '/popcorn-scoop-fresh.jpg', alt: 'Fresh kettle corn in a metal scoop', caption: "Bagged while it's warm" },
];

export default function Story() {
  return (
    <section className="v3-section" id="our-story" aria-labelledby="story-title">
      <div className="main-container">
        <div className={styles.grid}>
          <div className={styles.photo}>
            <Image
              src="/bob-reina.webp"
              alt="Bob and Reina Andersen hugging at their kettle corn stand"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className={styles.image}
            />
          </div>

          <div className={styles.copy}>
            <span className="v3-eyebrow">Our story</span>
            <h2 id="story-title" className="v3-title">
              Two healthcare workers, one kettle, a lot of burnt corn
            </h2>
            <p>
              We started The Queen&apos;s Corn in 2017 because we were tired of bland kettle corn at
              local events. We both work in the medical field, so we learned the hard way: at first
              we burnt more corn than we sold.
            </p>
            <p>
              Today we pop at markets across Arizona with pure corn oil, sugar and salt, and we&apos;ll
              never switch to a cheaper ingredient.
            </p>
            <blockquote className={styles.quote}>&ldquo;The Queen&apos;s Corn is a happy place.&rdquo;</blockquote>
            <Button href="/story" variant="ghost" size="sm">
              Read our story
            </Button>
          </div>
        </div>

        <ol className={styles.steps} aria-label="How we make it">
          {STEPS.map((step, i) => (
            <li key={step.src}>
              <div className={styles.stepPhoto}>
                <Image src={step.src} alt={step.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className={styles.image} />
              </div>
              <p className={styles.caption}>
                <b>{i + 1}</b>
                {step.caption}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
