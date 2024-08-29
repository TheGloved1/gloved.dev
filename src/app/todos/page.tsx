import Link from 'next/link'
import TodoPage from './_components/todo-page'
import ChevronLeft from '@/components/chevron-left'
import React from 'react'

export default function Page(): React.JSX.Element {
  return (
    <>
      <Link href={'/'} className="fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2">
        <button className="btn flex flex-row items-center justify-center">
          <ChevronLeft />
          {'Back'}
        </button>
      </Link>
      <TodoPage />
    </>
  )
}
