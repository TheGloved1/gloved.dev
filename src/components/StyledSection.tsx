import "src/styles/globals.css";
import React, { useEffect, useRef, useState } from 'react';

export default function StyledSection({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
        }
      },
      { threshold: 0.1 }
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
      className={`flex flex-col items-center justify-center h-screen text-center box-border ${isInView ? 'animate-fadeIn' : 'no-visibility'}`}
    >
      {children}
    </section>
  );
};
