'use client';
import { useThreadMessages } from '@/hooks/use-chat-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMount } from '@/hooks/use-mount';
import { sleep } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import ChatInput from '../../_components/ChatInput';
import ChatMessage from '../../_components/ChatMessage';

export default function ThreadMessages() {
  const { threadId } = useParams<{ threadId: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const distanceFromBottom = useRef<number>(0);
  const isMobile = useIsMobile();
  const { messages, isLoading } = useThreadMessages(threadId);

  useMount(() => {
    const scrollToBottom = () => {
      if (!scrollContainerRef.current) return;
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    };
    scrollToBottom();
    sleep(250).then(() => {
      scrollToBottom();
    });
  });

  const scrollToBottom = useCallback(() => {
    if (!autoScroll || isMobile || !scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    setIsAtBottom(true);
  }, [autoScroll, isMobile]);

  const handleScrollButton = () => {
    setAutoScroll(true);
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    setIsAtBottom(true);
  };

  useLayoutEffect(() => {
    if (!scrollContainerRef.current) return;
    if (autoScroll) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = useCallback(
    (e?: React.UIEvent<HTMLDivElement>) => {
      if (!scrollContainerRef.current) return;
      distanceFromBottom.current =
        scrollContainerRef.current.scrollHeight -
        (scrollContainerRef.current.scrollTop || e?.currentTarget.scrollTop || 0) -
        988;
      if (distanceFromBottom.current > 200) {
        setAutoScroll(false);
        setIsAtBottom(false);
      }
      if (!autoScroll && distanceFromBottom.current < 200) {
        setAutoScroll(true);
        setIsAtBottom(true);
      }
    },
    [autoScroll],
  );

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput scrollButtonCallback={handleScrollButton} isAtBottom={isAtBottom} />
      <div className='relative flex-1 overflow-clip'>
        {isLoading ?
          <div className='flex h-[100dvh] items-center justify-center overflow-x-clip pb-32'>
            <span className='loading loading-spinner loading-lg'></span>
          </div>
        : <div
            onScroll={handleScroll}
            ref={scrollContainerRef}
            className='scrollbar-w-2 h-[100dvh] overflow-y-auto overflow-x-clip pb-32 scrollbar-thin scrollbar-track-transparent'
          >
            <div className='mx-auto flex w-full max-w-3xl translate-x-1 flex-col space-y-12 p-4 pb-16 text-sm'>
              {messages.map((message) => (
                <ChatMessage message={message} key={message.id} />
              ))}
            </div>
          </div>
        }
      </div>
    </main>
  );
}
