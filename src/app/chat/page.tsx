import * as constants from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'
import ChatBot from './_components/ChatBot'

export const metadata: Metadata = {
  title: `${constants.NAME} | ${constants.Chat.title}`,
  description: constants.Chat.description,
}

export default function Page(): React.JSX.Element {
  return <ChatBot />
}
