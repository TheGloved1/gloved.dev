import ChatBotSidebar from './_components/ChatBotSidebar'
import { Metadata } from 'next'
import * as constants from '@/lib/constants'

export const metadata: Metadata = {
  title: `${constants.NAME} | ${constants.Chat.title}`,
  description: constants.Chat.description,
}

export default function Template({ children }: { children: React.ReactNode }) {
  return <ChatBotSidebar>{children}</ChatBotSidebar>
}
