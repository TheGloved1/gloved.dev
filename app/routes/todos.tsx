import TodoPage from './todos/todo-page'
import ChevronLeft from '@/components/ChevronLeft'
import React from 'react'
import { Link, MetaFunction } from '@remix-run/react'
import { NAME, Todos } from '@/lib/constants'

export const meta: MetaFunction = () => {
  return [{ title: NAME + ' | ' + Todos.title }, { name: 'description', content: Todos.description }]
}
export default function Page(): React.JSX.Element {
  return (
    <>
      <div className='h-dvh w-dvw bg-[#333]'>
        <Link to={'/'} className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2' replace>
          <button className='btn flex flex-row items-center justify-center'>
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <TodoPage />
      </div>
    </>
  )
}
