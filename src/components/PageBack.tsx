'use client'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PageBack({ stayTop, className }: { stayTop?: boolean; className?: string }): React.JSX.Element {
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
          ? cn('fixed bottom-auto left-2 top-2 flex flex-row items-center justify-center', className)
          : cn('fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2', className)
      }
    >
      <button className="btn flex flex-row items-center justify-center">
        <ChevronLeft />
        <span className="hidden p-1 sm:block">{'Back'}</span>
      </button>
    </Link>
  )
}
