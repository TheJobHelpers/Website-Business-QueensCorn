'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { getImageProps } from 'next/image';
import Button from './ui/Button';
import styles from './Hero.module.css';

// The original centered hero (photo behind, dark shade, centered copy, flavor chips, two
// actions), restyled with design system v3.1 tokens. Behind it, a few real photos fade
// from one to the next.
const FLAVORS = ['Sweet & Salty', 'Caramel', 'Caramel Apple', 'Cheddar', 'Nacho Cheddar', 'BBQ Cheddar'];

const SLIDE_MS = 6000;

interface Photo {
  src: string;
  width: number;
  height: number;
  /** object-position: which part of the photo to keep in view */
  focus: string;
}

// Art direction: `wide` shows on desktop, `tall` on phones.
const SLIDES: { alt: string; wide: Photo; tall: Photo }[] = [
  {
    alt: "Kettle corn being made by hand under The Queen's Corn yellow canopy",
    wide: { src: '/bob-pouring-kernels.jpg', width: 1024, height: 682, focus: '50% 20%' },
    tall: { src: '/reina-stirring-kettle.jpg', width: 768, height: 1024, focus: '50% 20%' },
  },
  {
    alt: "Bob and Reina hugging at The Queen's Corn stand",
    wide: { src: '/bob-reina.webp', width: 1240, height: 932, focus: '50% 28%' },
    tall: { src: '/bob-reina.webp', width: 1240, height: 932, focus: '50% 50%' },
  },
  {
    alt: 'A heap of fresh caramel and cheddar kettle corn with a metal scoop',
    wide: { src: '/popcorn-scoop-fresh.jpg', width: 1024, height: 682, focus: '50% 85%' },
    tall: { src: '/popcorn-scoop-fresh.jpg', width: 1024, height: 682, focus: '68% 50%' },
  },
];

function Slide({ slide, active, first }: { slide: (typeof SLIDES)[number]; active: boolean; first: boolean }) {
  const common = { alt: slide.alt, sizes: '100vw' };
  const {
    props: { srcSet: wide },
  } = getImageProps({ ...common, ...slide.wide });
  const {
    props: { srcSet: tall, ...img },
  } = getImageProps({ ...common, ...slide.tall, priority: first });

  return (
    <picture>
      <source media="(min-width: 769px)" srcSet={wide} sizes="100vw" />
      <source srcSet={tall} sizes="100vw" />
      <img
        {...img}
        alt={slide.alt}
        aria-hidden={!active}
        className={`${styles.photo} ${active ? styles.photoActive : ''}`}
        style={{ '--focus-wide': slide.wide.focus, '--focus-tall': slide.tall.focus } as CSSProperties}
      />
    </picture>
  );
}

export default function Hero() {
  // `reached` = how far the slideshow has got: later photos load one step ahead, not all at once.
  const [{ active, reached }, setShow] = useState({ active: 0, reached: 1 });

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setShow((s) => {
        const next = (s.active + 1) % SLIDES.length;
        return { active: next, reached: Math.max(s.reached, next + 1) };
      });
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {SLIDES.map(
        (slide, i) =>
          i <= reached && <Slide key={slide.alt} slide={slide} active={i === active} first={i === 0} />
      )}
      <div className={styles.shade} aria-hidden="true" />

      <div className={styles.content}>
        <span className={styles.badge}>Family-Owned Kettle Corn</span>
        <h1 id="hero-title" className={styles.title}>
          The Queen&apos;s Corn is a <em>Happy Place</em>
        </h1>
        <p className={styles.description}>
          Creating smiles one kernel at a time. From our family to yours, enjoy handcrafted kettle
          corn made fresh for Arizona’s markets, events, and happy moments.
        </p>
        <ul className={styles.flavorChips} aria-label="Our flavors">
          {FLAVORS.map((flavor) => (
            <li key={flavor} className={styles.chip}>
              {flavor}
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button href="/shop" variant="red">
            Shop our flavors
          </Button>
          <Button href="/contact" variant="light">
            Book us for events
          </Button>
        </div>
      </div>
    </section>
  );
}
