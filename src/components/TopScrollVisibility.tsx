'use client'
import React, { useEffect, useState } from 'react'

export default function TopScrollVisibility({
  children,
  offset,
}: {
  children: React.ReactNode
  offset?: number
}) {
  const [isAtTop, setIsAtTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      if (offset) {
        setIsAtTop(window.scrollY === 0 || window.scrollY < offset)
      } else {
        setIsAtTop(window.scrollY === 0)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{isAtTop && children}</>
}
