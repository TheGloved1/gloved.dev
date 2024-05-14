import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface StyledSectionProps {
  children: ReactNode;
  id?: string;
}

export default function StyledSection({ children, id }: StyledSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`flex flex-col items-center justify-center h-screen text-center box-border animate-in animate-out ${isInView ? 'animate-enter' : 'animate-leave'}`}
    >
      {children}
    </section>
  );
};
