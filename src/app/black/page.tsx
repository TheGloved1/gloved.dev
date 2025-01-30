import PageBack from '@/components/PageBack'
import { NAME, Black } from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: NAME + ' | ' + Black.title,
  description: Black.description,
}

export default function Page(): React.JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <PageBack />
      <p className="rounded-xl bg-neutral-950 p-2 text-sm text-neutral-900">{"This is a black screen... that's it."}</p>
    </main>
  )
}
