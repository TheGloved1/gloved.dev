/** @format */

'use client'

import React, { ComponentPropsWithoutRef, ReactNode, useEffect, useRef, useState } from 'react'

type StyledSectionProps = {
  children: React.ReactNode
  id?: string
  className?: string
} & React.ComponentPropsWithoutRef<'section'>

export default function StyledSection({ children, className, id, ...props }: StyledSectionProps): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting)
        }
      },
      { threshold: 0.5 }
    )

    let sectionRefCurrent = sectionRef.current

    if (sectionRefCurrent) {
      observer.observe(sectionRefCurrent)
    }

    return () => {
      if (sectionRefCurrent) {
        observer.unobserve(sectionRefCurrent)
      }
    }
  }, [])

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`flex min-h-[95vh] flex-col items-center justify-center text-center tracking-tight ${className} ${isInView ? 'fade-in-left' : 'fade-out-left'}`}
      {...props}
    >
      {children}
    </section>
  )
}
