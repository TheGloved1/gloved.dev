import React, { useEffect, useRef, useState } from 'react';

export default function StyledSection({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting);
          console.log(entry.isIntersecting);
        }
      },
      { threshold: 1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
      console.log(sectionRef.current);
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
