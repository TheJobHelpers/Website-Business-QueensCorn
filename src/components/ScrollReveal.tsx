'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** 1–4 = steps of the site stagger (see --stagger in globals.css) */
  delay?: number;
  /** kept for older call sites: every type now fades up (sideways slides jumped on phones) */
  type?: 'fade-up' | 'slide-right' | 'slide-left';
}

// Fades its children up once, when they scroll into view (.reveal in globals.css).
export default function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      // start a little before the block is fully in, so it is already moving as it arrives
      { threshold: 0.05, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const step = Math.max(0, Math.min(4, Math.round(delay)));

  return (
    <div ref={elementRef} className={`reveal ${step ? `reveal-delay-${step}` : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}
