import Constants from '@/lib/constants';
import { Metadata } from 'next';
import ChatBotSidebar from './_components/ChatBotSidebar';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.Chat.title}`,
  description: Constants.Chat.description,
};

export default function Template({ children }: { children: React.ReactNode }) {
  return <ChatBotSidebar>{children}</ChatBotSidebar>;
}
