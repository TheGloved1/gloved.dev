'use client';
import { checkSync } from '@/lib/dexie';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect } from 'react';
import ChatInput from './_components/ChatInput';

export const dynamic = 'force-static';

export default function Page(): React.JSX.Element {
  const auth = useAuth();

  useEffect(() => {
    if (auth.userId) {
      checkSync(auth.userId);
    }
  }, [auth.userId]);

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput createThread={true} isAtBottom={true} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600'>
          <div className='mx-auto flex w-full max-w-2xl translate-x-1 flex-col space-y-12 p-3 pb-8 text-sm'></div>
        </div>
      </div>
    </main>
  );
}
