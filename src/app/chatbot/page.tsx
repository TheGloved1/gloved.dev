import ChatBot from '@/components/ChatBot'
import PageBack from '@/components/PageBack'
import { NAME } from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'
import './chatbot.css'

export const metadata: Metadata = {
  title: `${NAME} | Chatbot`,
  description: 'A simple chatbot web app.',
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <PageBack />
      <ChatBot />
    </>
  )
}
