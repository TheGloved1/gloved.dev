'use client'

import React, { ComponentPropsWithoutRef } from "react"

type ScrollLinkProps = {
  children: React.ReactNode
  to: string
} & ComponentPropsWithoutRef<'button'>

export default function ScrollLink({ children, to: href, ...props }: ScrollLinkProps): React.JSX.Element {
  function handleScroll(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, href: string) {
    event.preventDefault()
    const element = document.getElementById(href.replace('#', ''))
    if (element) {
      const offset = 25 // Adjust this value to set the desired offset
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      scrollTo({
        top: offsetPosition,
        behavior: 'smooth', // Use 'smooth' for smooth scrolling
      })
    }
  }

  return (
    <button onClick={(e) => handleScroll(e, href)} {...props}>
      {children}
    </button>
  )
}
