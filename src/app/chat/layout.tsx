import Constants from '@/lib/constants';
import { Metadata } from 'next';
import ChatSidebar from './_components/ChatSidebar';

export const metadata: Metadata = {
  title: Constants.Chat.title,
  description: Constants.Chat.description,
  icons: '/bot.webp',
  openGraph: {
    title: Constants.Chat.title,
    description: Constants.Chat.description,
    url: `https://${Constants.NAME}/chat`,
    type: 'website',
    siteName: Constants.NAME,
    locale: 'en_US',
    images: [
      {
        url: `https://${Constants.NAME}/bot.webp`,
        width: 400,
        height: 400,
        alt: 'Logo',
      },
    ],
  },
};

export const dynamic = 'force-static';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ChatSidebar>{children}</ChatSidebar>;
}
