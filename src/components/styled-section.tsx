"use client"
/* eslint-disable prefer-const */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as React from "react"

type StyledSectionProps = {
  children: ReactNode
  id?: string
  className?: string
}

export default function StyledSection({ children, id, className }: StyledSectionProps) {
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
    }

    return () => {
      if (sectionRefCurrent) {
        observer.unobserve(sectionRefCurrent)
      }
    }
  })

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`flex flex-col items-center justify-center min-h-[95vh] text-center tracking-tight ${className} ${isInView ? 'fade-in-left' : ''}`}
    >
      {children}
    </section>
  )

}
