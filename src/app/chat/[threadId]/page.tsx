'use client';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { dxdb } from '@/lib/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { redirect, useParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import ChatInput from '../_components/ChatInput';
import ChatMessage from '../_components/ChatMessage';

export const dynamic = 'force-static';

export default function Page(): React.JSX.Element {
  const { threadId } = useParams<{ threadId: string }>();
  const {
    ref,
    isIntersecting: isAtBottom,
    entry,
  } = useIntersectionObserver({
    root: null,
    rootMargin: '0px',
    threshold: 1,
  });

  useEffect(() => {
    dxdb.getThread(threadId).then((thread) => {
      if (!thread) redirect('/chat');
    });
  }, [threadId]);

  const scrollToBottom = useCallback(
    (noSmooth?: boolean) => {
      entry?.target?.scrollIntoView({ behavior: noSmooth ? 'instant' : 'smooth' });
    },
    [entry?.target],
  );

  const messages = useLiveQuery(
    () => {
      scrollToBottom();
      return dxdb.getThreadMessages(threadId);
    },
    [threadId, dxdb.messages],
    [],
  );

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput scrollCallback={scrollToBottom} isAtBottom={isAtBottom} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto overflow-x-clip pb-36 scrollbar-thin scrollbar-track-transparent'>
          <div className='mx-auto flex w-full max-w-3xl translate-x-1 flex-col space-y-12 p-4 pb-12 text-sm'>
            {messages.map((message) => (
              <ChatMessage scrollEditCallback={scrollToBottom} message={message} key={message.id} />
            ))}
          </div>
          <div ref={ref} className='mt-6 h-0 w-0' />
        </div>
      </div>
    </main>
  );
}
