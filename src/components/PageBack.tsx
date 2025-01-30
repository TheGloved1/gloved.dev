'use client'
import Link from 'next/link'
import ChevronLeft from './ChevronLeft'

export default function PageBack({ stayTop }: { stayTop?: boolean }): React.JSX.Element {
  return (
    <Link
      href={'/'}
      onClick={(e) => {
        e.preventDefault()
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/'
        }
      }}
      className={
        stayTop
          ? 'fixed bottom-auto left-2 top-2 flex flex-row items-center justify-center pl-0'
          : 'fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2'
      }
    >
      <button className="btn flex flex-row items-center justify-center">
        <ChevronLeft />
        <span className="hidden p-1 sm:block">{'Back'}</span>
      </button>
    </Link>
  )
}
