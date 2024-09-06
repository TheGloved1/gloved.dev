'use client'
import Link from 'next/link'

export default function ScrollLink(props: { children: React.ReactNode; href: string; className?: string }): React.JSX.Element {
  function handleScroll(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, href: string) {
    event.preventDefault()
    const element = document.getElementById(href.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'auto' })
    }
  }
  return (
    <button className={props.className} onClick={(e) => handleScroll(e, props.href)}>
      {props.children}
    </button>
  )
}
