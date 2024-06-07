"use client"
/* eslint-disable prefer-const */
import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as React from "react"


export default function StyledSection(props: { children: ReactNode, id?: string, className?: string }) {

  const sectionRef = useRef(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting)
        }
      },
      { threshold: 0.2 }
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
      className={`flex flex-col items-center justify-center min-h-[95vh] text-center tracking-tight ${props.className} ${isInView ? 'fade-in-left' : ''}`}
    >
      {props.children}
    </section>
  )

}
