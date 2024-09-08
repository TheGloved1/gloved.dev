'use client'

import { cn } from '@/lib/utils'
import React, { useEffect, useRef, useState } from 'react'

type ObserverSectionProps = {
  children: React.ReactNode
  id?: string
  className?: string
} & React.ComponentPropsWithoutRef<'section'>

export default function ObserverSection({ children, className, id, ...props }: ObserverSectionProps): React.JSX.Element {
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
      className={cn(
        `flex min-h-svh flex-col items-center justify-center text-center tracking-tight ${isInView ? 'fade-in-left' : 'fade-out-left'}`,
        className ? ` ${className}` : ''
      )}
      {...props}
    >
      {children}
    </section>
  )
}
