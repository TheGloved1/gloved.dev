"use client"
/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState, type ReactNode } from 'react'

interface StyledSectionProps {
  children: ReactNode
  id?: string
}

export default function StyledSection({ children, id }: StyledSectionProps) {
  console.log('Rendering StyledSection...')

  const sectionRef = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting)
        }
      },
      { threshold: 0.1 }
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
  }, [sectionRef])

  if (!isInView) {
    return (
      <section
        id={id}
        ref={sectionRef}
        className={`flex flex-col items-center justify-center h-screen text-center tracking-tight snap-center`}
      >
      </section>
    )

  } else {
    return (
      <section
        id={id}
        ref={sectionRef}
        className={`flex flex-col items-center justify-center h-screen text-center tracking-tight snap-center ${isInView ? 'fade-in-left' : ''}`}
      >
        {children}
      </section>
    )

  }
}
