import PageBack from '@/components/PageBack'
import { NAME, Todos } from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'
import TodoPage from './todo-page'

export const metadata: Metadata = {
  title: NAME + ' | ' + Todos.title,
  description: Todos.description,
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className="h-dvh w-dvw bg-[#333]">
        <PageBack />
        <TodoPage />
      </div>
    </>
  )
}
