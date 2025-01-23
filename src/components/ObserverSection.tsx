'use client'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import React, { ComponentPropsWithoutRef, useEffect, useRef, useState } from 'react'

type ObserverSectionProps = {
  children: React.ReactNode
  id?: string
  className?: string
} & ComponentPropsWithoutRef<'section'>

export default function ObserverSection({ children, className, id }: ObserverSectionProps): React.JSX.Element {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsInView(entry.isIntersecting)
        } else {
          setIsInView(false)
        }
      },
      { threshold: 0.5 }
    )

    const sectionRefCurrent = sectionRef.current

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
    <motion.section
      id={id}
      initial={{ opacity: 0, scale: 0, x: -1000 }}
      animate={{ opacity: 0, scale: 0, x: -1000 }}
      whileInView={{ opacity: 1, scale: 1, x: 0 }}
      ref={sectionRef}
      className={cn(
        `flex min-h-svh flex-col items-center justify-center text-center tracking-tight ${
          isInView ? 'fade-in-left' : 'fade-out-left'
        }`,
        className ? ` ${className}` : ''
      )}
    >
      {children}
    </motion.section>
  )
}
