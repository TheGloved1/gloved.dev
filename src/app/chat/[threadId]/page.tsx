'use client';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { checkSync, dxdb } from '@/lib/dexie';
import { useAuth } from '@clerk/nextjs';
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
  const auth = useAuth();

  useEffect(() => {
    dxdb.getThread(threadId).then((thread) => {
      if (!thread) redirect('/chat');
    });
  }, [threadId]);

  const scrollToBottom = useCallback(
    (noSmooth?: boolean) => {
      entry?.target?.scrollIntoView({ behavior: noSmooth ? 'auto' : 'smooth' });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry, isAtBottom],
  );

  const messages = useLiveQuery(
    () => {
      scrollToBottom();
      return dxdb.getThreadMessages(threadId);
    },
    [threadId, dxdb.messages],
    [],
  );

  useEffect(() => {
    if (auth.userId) {
      checkSync(auth.userId);
    }
  }, [auth.userId, threadId]);

  useEffect(() => {
    scrollToBottom();
  }, [ref, scrollToBottom]);

  // Initial scroll to bottom (after component mounts and data is available)
  useEffect(() => {
    if (messages) scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput scrollCallback={scrollToBottom} isAtBottom={isAtBottom} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent'>
          <div className='mx-auto flex w-full max-w-3xl translate-x-1 flex-col space-y-12 p-4 pb-12 text-sm'>
            {messages.map((message) => (
              <ChatMessage scrollEditCallback={() => scrollToBottom(true)} message={message} key={message.id} />
            ))}
          </div>
          <div ref={ref} className='h-0 w-0' />
        </div>
      </div>
    </main>
  );
}
