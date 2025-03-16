'use client';
import { checkSync, dxdb } from '@/dexie';
import { useAuth } from '@clerk/nextjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { redirect, useParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatBotInput from '../_components/ChatInput';
import ChatMessage from '../_components/ChatMessage';

export const dynamic = 'force-static';

export default function Page(): React.JSX.Element {
  const { threadId } = useParams<{ threadId: string }>();
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();

  useEffect(() => {
    dxdb.getThread(threadId).then((thread) => {
      if (!thread) redirect('/chat');
    });
  }, [threadId]);

  const scrollToBottom = useCallback((noSmooth?: boolean) => {
    messagesEndRef.current?.scrollIntoView({ behavior: noSmooth ? 'auto' : 'smooth' });
  }, []);

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
    const msgEndRef = messagesEndRef?.current;
    const observer = new IntersectionObserver(
      (entries) => {
        setIsAtBottom(entries[0].isIntersecting);
      },
      { root: null, rootMargin: '0px', threshold: 1 },
    );
    if (msgEndRef) {
      observer.observe(msgEndRef);
    }
    return () => {
      if (msgEndRef) {
        observer.unobserve(msgEndRef);
      }
    };
  }, [messagesEndRef, scrollToBottom]);

  // Initial scroll to bottom (after component mounts and data is available)
  useEffect(() => {
    if (messages) scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatBotInput scrollCallback={scrollToBottom} isAtBottom={isAtBottom} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600'>
          <div className='mx-auto flex w-full max-w-3xl translate-x-1 flex-col space-y-12 p-4 pb-12 text-sm'>
            {messages.map((message) => (
              <ChatMessage scrollEditCallback={() => scrollToBottom(true)} message={message} key={message.id} />
            ))}
          </div>
          <div ref={messagesEndRef} className='h-0 w-0' />
        </div>
      </div>
    </main>
  );
}
