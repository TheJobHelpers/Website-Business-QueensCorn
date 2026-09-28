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
    const currentElement = elementRef.current;
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

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);


  const typeClass = type === 'fade-up' ? '' : type;
  const isIntegerStep = Number.isInteger(delay) && delay >= 1 && delay <= 4;
  const delayClass = isIntegerStep ? `reveal-delay-${delay}` : '';
  const customStyle =
    delay > 0 && !isIntegerStep
      ? { transitionDelay: `${Number((delay * 0.1).toFixed(2))}s` }
      : undefined;

  return (
    <div 
      ref={elementRef} 
      className={`reveal ${typeClass} ${delayClass} ${className}`.trim()}
      style={customStyle}
    >
      {children}
    </div>
  );
}
