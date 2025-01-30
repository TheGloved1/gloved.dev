import ChatBot from '@/components/ChatBot'
import ChevronLeft from '@/components/ChevronLeft'
import { NAME } from '@/lib/constants'
import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: `${NAME} | Chatbot`,
  description: 'A simple chatbot web app. Ask me anything.',
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white">
        <Link
          href={'/'}
          className="fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2"
        >
          <button className="btn flex flex-row items-center justify-center">
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <div className="flex flex-col items-center justify-center gap-12 self-center px-4 py-32">
          <ChatBot />
        </div>
      </main>
    </>
  )
}
