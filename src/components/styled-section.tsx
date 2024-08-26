'use client'
/* eslint-disable prefer-const */
import React, { useEffect, useRef, useState, type ReactNode } from 'react'

export default function StyledSection(props: { children: ReactNode; id?: string; className?: string }) {
  const sectionRef = useRef(null)
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
  })

  return (
    <section
      id={props.id}
      ref={sectionRef}
      className={`flex min-h-[95vh] flex-col items-center justify-center text-center tracking-tight ${props.className} ${isInView ? 'fade-in-left' : 'fade-out-left'}`}
    >
      {props.children}
    </section>
  )
}
