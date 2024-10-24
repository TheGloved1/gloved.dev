import ChevronLeft from '@/components/ChevronLeft'
import { NAME, Black } from '@/lib/constants'
import { Link, MetaFunction } from '@remix-run/react'
import React from 'react'

export const meta: MetaFunction = () => {
  return [{ title: NAME + ' | ' + Black.title }, { name: 'description', content: Black.description }]
}

export default function Page(): React.JSX.Element {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-black text-white'>
      <Link to={'/'} className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2'>
        <button className='btn flex flex-row items-center justify-center'>
          <ChevronLeft />
          {'Back'}
        </button>
      </Link>
      <p className='rounded-xl bg-neutral-950 p-2 text-sm text-neutral-900'>{"This is a black screen... that's it."}</p>
    </main>
  )
}
