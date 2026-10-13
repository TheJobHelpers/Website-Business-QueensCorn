'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { getImageProps } from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import Button from './ui/Button';
import { useCart } from '@/context/CartContext';
import { getUpcomingEvents, weekdayLabel } from '@/lib/events';
import { useHydrated } from '@/lib/useHydrated';
import styles from './Hero.module.css';

// The original centered hero (photo behind, dark shade, centered copy, two actions), restyled with design system v3.1 tokens. Behind it, a few real photos fade
// from one to the next (the popcorn first), with dots to move between them. Only photos that
// stay calm behind the headline are used: bright canopies with printed lettering made it hard to read. Under the buttons,
// the next market from the owners' calendar.
const SLIDE_MS = 6000;

interface Photo {
  src: string;
  width: number;
  height: number;
  /** object-position: which part of the photo to keep in view */
  focus: string;
}

// Art direction: `wide` shows on desktop, `tall` on phones.
const SLIDES: { alt: string; label: string; wide: Photo; tall: Photo }[] = [
  {
    alt: 'A heap of fresh caramel and cheddar kettle corn with a metal scoop',
    label: 'Fresh kettle corn',
    wide: { src: '/popcorn-scoop-fresh.jpg', width: 1024, height: 682, focus: '50% 85%' },
    tall: { src: '/popcorn-scoop-fresh.jpg', width: 1024, height: 682, focus: '68% 50%' },
  },
  {
    alt: "Kettle corn being made by hand under The Queen's Corn yellow canopy",
    label: 'At the kettle',
    wide: { src: '/bob-pouring-kernels.jpg', width: 1024, height: 682, focus: '50% 20%' },
    tall: { src: '/reina-stirring-kettle.jpg', width: 768, height: 1024, focus: '50% 20%' },
  },
];

function Slide({ slide, active, first, quick }: { slide: (typeof SLIDES)[number]; active: boolean; first: boolean; quick: boolean }) {
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
        className={`${styles.photo} ${active ? styles.photoActive : ''} ${quick ? styles.photoQuick : ''}`}
        style={{ '--focus-wide': slide.wide.focus, '--focus-tall': slide.tall.focus } as CSSProperties}
      />
    </picture>
  );
}

export default function Hero() {
  // `reached` = how far the slideshow has got: later photos load one step ahead, not all at once.
  // `quick` = the photo was picked with a dot, so it changes at once instead of drifting in.
  const [{ active, reached, quick }, setShow] = useState({ active: 0, reached: 1, quick: false });
  // bumped when a dot is pressed, so the timer starts again from that photo
  const [restart, setRestart] = useState(0);
  const { events } = useCart();
  const hydrated = useHydrated();
  // the page is prerendered, so "next" is only worked out in the visitor's browser
  const nextMarket = hydrated ? getUpcomingEvents(events)[0] : undefined;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      setShow((s) => {
        const next = (s.active + 1) % SLIDES.length;
        return { active: next, reached: Math.max(s.reached, next + 1), quick: false };
      });
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [restart]);

  const show = (index: number) => {
    setShow((s) => ({ active: index, reached: Math.max(s.reached, index + 1), quick: true }));
    setRestart((n) => n + 1);
  };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      {SLIDES.map(
        (slide, i) =>
          i <= reached && <Slide key={slide.alt} slide={slide} active={i === active} first={i === 0} quick={quick} />
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
        <div className={styles.actions}>
          <Button href="/shop" variant="red">
            Shop our flavors
          </Button>
          <Button href="/contact" variant="light">
            Book us for events
          </Button>
        </div>

        {/* keeps its height before it is filled in, so nothing jumps */}
        <p className={styles.next}>
          {nextMarket && (
            <Link href="/events" className={styles.nextLink}>
              <CalendarDays size={16} aria-hidden="true" />
              <span>
                <b>Next market</b> · {weekdayLabel(nextMarket)}, {nextMarket.month} {nextMarket.day.replace('-', '–')} · {nextMarket.title}
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          )}
        </p>

        <div className={styles.dots} role="group" aria-label="Background photo">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.alt}
              type="button"
              className={`${styles.dot} ${i === active ? styles.dotOn : ''}`}
              aria-label={slide.label}
              aria-pressed={i === active}
              onClick={() => show(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
