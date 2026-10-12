import type { Metadata } from 'next';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import styles from './StoryPage.module.css';

export const metadata: Metadata = {
  title: "Our Story | The Queen's Corn",
  description:
    "Bob and Reina Andersen started The Queen's Corn in 2017. Two healthcare workers, one kettle, and kettle corn made with pure corn oil, sugar and salt.",
};

// Our Story page, design system v3.1. The founders' story in their own words:
// who they are, how it started, what goes in the kettle, how it is made, and where they are today.
const INGREDIENTS = ['Corn oil', 'Sugar', 'Salt'];

const STEPS = [
  { src: '/bob-pouring-kernels.jpg', alt: 'Bob pouring kernels into the kettle', caption: 'Kernels into the kettle' },
  { src: '/reina-stirring-kettle.jpg', alt: 'Reina stirring the kettle with a long wooden paddle', caption: 'Stirred by hand, nonstop' },
  { src: '/popcorn-scoop-fresh.jpg', alt: 'Fresh kettle corn in a metal scoop', caption: "Bagged while it's warm" },
];

export default function StoryPage() {
  return (
    <main className={styles.page}>
      <div className="main-container">
        {/* 1. Who we are: copy on espresso, the two of them in full colour */}
        <header className={`${styles.head} enter`}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Our story</span>
            <h1 className={styles.title}>
              Two healthcare workers, one kettle, <em>a lot of burnt corn.</em>
            </h1>
            <p className={styles.lede}>
              The Queen&apos;s Corn is Bob and Reina Andersen, a husband-and-wife team popping kettle corn at
              Arizona markets since 2017.
            </p>
          </div>
          <div className={styles.headPhoto}>
            <Image
              src="/bob-reina.webp"
              alt="Bob and Reina Andersen hugging at their kettle corn stand"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 45vw"
            />
          </div>
        </header>

        {/* 2. How it started */}
        <section className={styles.chapter} aria-labelledby="started-title">
          <div className={styles.text}>
            <span className="v3-eyebrow">How it started</span>
            <h2 id="started-title" className="v3-title">
              We were tired of bland kettle corn
            </h2>
            <p>
              The Queen&apos;s Corn was established in 2017 by husband-and-wife team{' '}
              <strong>Bob and Reina Andersen</strong>. To be honest, we never dreamed of popping kettle corn
              because we both work in the medical field.
            </p>
            <p>
              We were simply tired of buying bland kettle corn with no flavor at local events. So, we decided to
              purchase our own equipment and make it ourselves. The learning curve was tough: we burnt more corn
              than we sold in those early days. With persistence, we perfected the art of the perfect pop.
            </p>
          </div>
          <div className={`${styles.photo} ${styles.tall}`}>
            <Image
              src="/reina-stirring-kettle.jpg"
              alt="Reina stirring the kettle under The Queen's Corn canopy"
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              className="fx-parallax"
            />
          </div>
        </section>

        {/* 3. What goes in the kettle */}
        <section className={`${styles.promise} fx-zoom`} aria-label="Our ingredients">
          <ul className={styles.ingredients}>
            {INGREDIENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <blockquote className={styles.quote}>
            &ldquo;We use pure corn oil, sugar, and salt. Details matter, and we will never change to a cheaper
            ingredient. Our bags are packed full, and our product is always made fresh.&rdquo;
          </blockquote>
          <p className={styles.cite}>Bob Andersen, co-founder</p>
        </section>

        {/* 4. How we make it */}
        <section className={styles.section} aria-labelledby="make-title">
          <span className="v3-eyebrow">How we make it</span>
          <h2 id="make-title" className="v3-title">
            By hand, at the stand, while you watch
          </h2>
          <ol className={`${styles.steps} fx-stagger`}>
            {STEPS.map((step, i) => (
              <li key={step.src}>
                <div className={styles.stepPhoto}>
                  <Image src={step.src} alt={step.alt} fill sizes="(max-width: 640px) 100vw, 33vw" />
                </div>
                <p className={styles.caption}>
                  <b>{i + 1}</b>
                  {step.caption}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. Today */}
        <section className={`${styles.chapter} ${styles.flip}`} aria-labelledby="today-title">
          <div className={styles.pair}>
            <div className={styles.photo}>
              <Image
                src="/booth-palm-trees.jpg"
                alt="The Queen's Corn stand and flag under Arizona palm trees"
                fill
                sizes="(max-width: 900px) 50vw, 22vw"
              />
            </div>
            <div className={styles.photo}>
              <Image
                src="/trailer-rainbow.jpg"
                alt="The Queen's Corn trailer under a rainbow"
                fill
                sizes="(max-width: 900px) 50vw, 22vw"
              />
            </div>
          </div>
          <div className={styles.text}>
            <span className="v3-eyebrow">Today</span>
            <h2 id="today-title" className="v3-title">
              A happy place, one kernel at a time
            </h2>
            <p>
              Today, we pop at local farmers&apos; markets and events across Phoenix, Payson, and the East Valley.
              We are passionate about our product and enjoy our customers tremendously.
            </p>
            <p>
              Reina and I always banter back and forth, and we usually get the customers to join in because{' '}
              <strong>The Queen&apos;s Corn is a happy place</strong> where smiles are created one kernel at a
              time.
            </p>
            <div className={styles.actions}>
              <Button href="/events" variant="dark">
                Find us at an event
              </Button>
              <Button href="/shop" variant="ghost">
                Shop flavors
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
