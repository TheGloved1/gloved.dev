import React from 'react'
import LoadingComponent from '@/components/loading'

export default function Loading(): React.JSX.Element {
  // Or a custom loading skeleton component
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-950 to-[#1e210c] text-white'>
      <p className='content-center'>
        Page is loading or has errored... <LoadingComponent />
      </p>
    </main>
  )
}
