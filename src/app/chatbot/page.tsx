import ChatBot from '@/components/ChatBot'
import ChevronLeft from '@/components/ChevronLeft'
import { NAME } from '@/lib/constants'
import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: `${NAME} | Chatbot`,
  description: 'A simple chatbot web app.',
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <Link
        href={'/'}
        className="fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2"
      >
        <button className="btn flex flex-row items-center justify-center">
          <ChevronLeft />
          {'Back'}
        </button>
      </Link>
      <ChatBot />
    </>
  )
}
