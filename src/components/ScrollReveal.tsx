'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: 'fade-up' | 'slide-right' | 'slide-left';
}

export default function ScrollReveal({ children, className = '', delay = 0, type = 'fade-up' }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  const typeClass = type === 'fade-up' ? '' : type;
  const delayClass = delay > 0 ? `reveal-delay-${delay}` : '';

  return (
    <div 
      ref={elementRef} 
      className={`reveal ${typeClass} ${delayClass} ${className}`}
    >
      {children}
    </div>
  );
}
