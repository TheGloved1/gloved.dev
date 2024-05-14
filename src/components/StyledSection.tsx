import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface StyledSectionProps {
  children: ReactNode;
  id?: string;
}

export default function StyledSection({ children, id }: StyledSectionProps) {
  console.log('Rendering StyledSection...');
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const refs = sectionRef;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.3 }
    );

    if (refs.current) {
      observer.observe(refs.current);
    }

    return () => {
      if (refs.current) {
        observer.unobserve(refs.current);
      }
    };
  }, []);


  return (
    <section
      id={id}
      ref={sectionRef}
      className={`flex-col items-center justify-center h-screen text-center box-border fade-in fade-out ${isInView ? 'flex' : 'flex-none'}`}
    >
      {children}
    </section>
  );
};
