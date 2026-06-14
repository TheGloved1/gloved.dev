'use client';
import { cn } from '@/lib/utils';
import React, { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react';

type ObserverSectionProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
} & ComponentPropsWithoutRef<'section'>;

const dirs = ['left', 'right'] as const;
type Dir = (typeof dirs)[number];

export default function ObserverSection({ children, className, id }: ObserverSectionProps): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const direction = dirs[Math.floor(Math.random() * dirs.length)];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
        } else {
          setIsInView(false);
        }
      },
      { threshold: 0.5 },
    );

    const sectionRefCurrent = sectionRef.current;

    if (sectionRefCurrent) {
      observer.observe(sectionRefCurrent);
    }

    return () => {
      if (sectionRefCurrent) {
        observer.unobserve(sectionRefCurrent);
      }
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={cn(
        `flex min-h-svh snap-start flex-col items-center justify-center text-center tracking-tight ${
          isInView ? `fade-in-${direction}` : `fade-out-${direction}`
        }`,
        className ? ` ${className}` : '',
      )}
    >
      {children}
    </section>
  );
}
