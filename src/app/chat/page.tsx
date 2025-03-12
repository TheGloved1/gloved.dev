'use client';
import { checkSync } from '@/dexie';
import { useAuth } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import ChatBotInput from './_components/ChatInput';

export const dynamic = 'force-static';

export default function Page(): React.JSX.Element {
  const [input, setInput] = useState<string>('');
  const [rows, setRows] = useState<number>(2);
  const [imagePreview, setImagePreview] = useState<string | null | undefined>(null);
  const auth = useAuth();

  useEffect(() => {
    // Count how many rows the textarea is by getting all '\n' in the input
    const minRows = 2;
    const maxRows = 6;
    const newRows = input.split('\n').length;
    setRows(Math.min(Math.max(minRows, newRows), maxRows));
  }, [input, rows, setRows]);

  useEffect(() => {
    if (auth.userId) {
      checkSync(auth.userId);
    }
  }, [auth.userId]);

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatBotInput
        input={input}
        setInputAction={setInput}
        imagePreview={imagePreview}
        setImagePreviewAction={setImagePreview}
        createThread={true}
        isAtBottom={true}
      />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600'>
          <div className='mx-auto flex w-full max-w-2xl translate-x-1 flex-col space-y-12 p-3 pb-8 text-sm'></div>
        </div>
      </div>
    </main>
  );
}
