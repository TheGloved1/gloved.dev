'use client'

export default function ScrollLink({ children, href, className }: { children: React.ReactNode; href: string; className?: string }): React.JSX.Element {
  function handleScroll(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, href: string) {
    event.preventDefault()
    const element = document.getElementById(href.replace('#', ''))
    if (element) {
      const offset = 25 // Adjust this value to set the desired offset
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth', // Use 'smooth' for smooth scrolling
      })
    }
  }

  return (
    <button className={className} onClick={(e) => handleScroll(e, href)}>
      {children}
    </button>
  )
}
