"use client"
/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState, type ReactNode } from 'react'

type StyledSectionProps = {
  children: ReactNode
  id?: string
  className?: string
}

export default function StyledSection({ children, id, className }: StyledSectionProps) {
  console.log(`Rendering StyledSection ${id}...`)
  const sectionRef = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting)
        }
      },
      { threshold: 0 }
    )

    let sectionRefCurrent = sectionRef.current

    if (sectionRefCurrent) {
      observer.observe(sectionRefCurrent)
      console.log(`${id} sectionRef observed`)
    }

    return () => {
      if (sectionRefCurrent) {
        observer.unobserve(sectionRefCurrent)
        console.log(`${id} sectionRef unobserved`)
      }
    }
  }, [sectionRef])

  if (!isInView) {
    return (
      <section
        id={id}
        ref={sectionRef}
        className={`flex flex-col items-center justify-center h-[85vh] text-center tracking-tight ${className}`}
      >
      </section>
    )

  } else {
    return (
      <section
        id={id}
        ref={sectionRef}
        className={`flex flex-col items-center justify-center h-screen text-center tracking-tight ${className} ${isInView ? 'fade-in-left' : ''}`}
      >
        {children}
      </section>
    )

  }
}
