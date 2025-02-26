import Constants from '@/lib/constants';
import { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { memo } from 'react';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.Chat.title}`,
  description: Constants.Chat.description,
};

export const dynamic = 'force-static';

export default nextDynamic(() =>
  Promise.resolve(
    memo(function ChatLayout({ children }: Readonly<{ children: React.ReactNode }>) {
      return <>{children}</>;
    }),
  ),
);
