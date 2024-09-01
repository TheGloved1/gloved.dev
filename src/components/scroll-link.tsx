'use client'
import Link from 'next/link'

export default function ScrollLink(props: { children: React.ReactNode; href: string; className?: string }): React.JSX.Element {
  function handleScroll(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) {
    event.preventDefault()
    const element = document.getElementById(href.replace('#', ''))
    if (element) {
      element.scrollIntoView({ behavior: 'auto' })
    }
  }
  return (
    <Link className={props.className} href={props.href} onClick={(e) => handleScroll(e, props.href)} scroll={false} replace>
      {props.children}
    </Link>
  )
}
