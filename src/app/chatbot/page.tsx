import ChatBot from '@/app/chatbot/ChatBot'
import * as constants from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'
import './chatbot.css'

export const metadata: Metadata = {
  title: `${constants.NAME} | ${constants.ChatBot.title}`,
  description: constants.ChatBot.description,
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <ChatBot />
    </>
  )
}
