import TodoPage from './todo-page'
import ChevronLeft from '@/components/ChevronLeft'
import React from 'react'
import { NAME, Todos } from '@/lib/constants'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: NAME + ' | ' + Todos.title,
  description: Todos.description,
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className="h-dvh w-dvw bg-[#333]">
        <Link
          href={'/'}
          className="fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2"
          replace
        >
          <button className="btn flex flex-row items-center justify-center">
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <TodoPage />
      </div>
    </>
  )
}
