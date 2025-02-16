'use client'
import React from 'react'

type ScrollLinkProps = {
  children: React.ReactNode
  href: string
  onClick?: () => void
} & React.ComponentPropsWithoutRef<'button'>

export default function ScrollLink({
  children,
  href,
  onClick,
  ...props
}: ScrollLinkProps): React.JSX.Element {
  function handleScroll(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault()
    const element = document.getElementById(href.replace('#', ''))
    if (element) {
      const offset = 25 // Adjust this value to set the desired offset
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <button onClick={(e) => handleScroll(e)} {...props}>
      {children}
    </button>
  )
}
