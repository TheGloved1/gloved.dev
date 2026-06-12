import ThemeChanger from '@/components/ThemeChanger';
import { ChatInputProvider } from '@/contexts/chat-input-context';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import SidebarWrapper from './_components/SidebarWrapper';

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

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeChanger>
      <SidebarWrapper>
        <ChatInputProvider>{children}</ChatInputProvider>
      </SidebarWrapper>
    </ThemeChanger>
  );
}
