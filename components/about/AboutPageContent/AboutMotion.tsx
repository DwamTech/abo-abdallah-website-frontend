'use client';

import { useEffect, useRef, useState } from 'react';
import { toArabicDigits } from '@/lib/arabicNumbers';

export function AboutMotionController() {
  useEffect(() => {
    const root = document.getElementById('about-page');

    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-about-reveal]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.setAttribute('data-reveal-visible', 'true'));
      return;
    }

    elements.forEach((element) => {
      const delay = Number(element.dataset.revealDelay ?? 0);
      element.style.setProperty('--about-reveal-delay', `${Math.min(delay, 540)}ms`);
      element.setAttribute('data-reveal-ready', 'true');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.setAttribute('data-reveal-visible', 'true');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -9% 0px', threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 1250,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const elementRef = useRef<HTMLElement>(null);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) return;

    let animationFrame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        observer.disconnect();
        const startedAt = performance.now();
        setDisplayValue(0);

        const update = (now: number) => {
          const progress = Math.min((now - startedAt) / duration, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.round(value * easedProgress));

          if (progress < 1) animationFrame = requestAnimationFrame(update);
        };

        animationFrame = requestAnimationFrame(update);
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.35 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [duration, value]);

  const accessibleValue = `${prefix}${toArabicDigits(value)}${suffix}`;

  return (
    <strong ref={elementRef} className={className} aria-label={accessibleValue}>
      {prefix}
      {toArabicDigits(displayValue)}
      {suffix}
    </strong>
  );
}
