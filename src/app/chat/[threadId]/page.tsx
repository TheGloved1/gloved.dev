'use client';
import { useIsMobile } from '@/hooks/use-mobile';
import { dxdb } from '@/lib/dexie';
import { sleep } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ChatInput from '../_components/ChatInput';
import ChatMessage from '../_components/ChatMessage';

export const dynamic = 'force-static';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const distanceFromBottom = useRef<number>(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    dxdb.getThread(threadId).then((thread) => {
      if (!thread) router.replace('/chat');
    });
  }, [router, threadId]);

  const messages = useLiveQuery(
    () => {
      return dxdb.getThreadMessages(threadId);
    },
    [threadId, dxdb.messages],
    [],
  );

  const scrollToBottom = useCallback(() => {
    if (!autoScroll || isMobile || !scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    setIsAtBottom(true);
  }, [autoScroll, isMobile, scrollContainerRef]);

  const handleScrollButton = () => {
    setAutoScroll(true);
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    setIsAtBottom(true);
  };

  useEffect(() => {
    const scrollToBottom = () => {
      if (!scrollContainerRef.current) return;
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsAtBottom(true);
    };
    scrollToBottom();
    sleep(250).then(() => {
      scrollToBottom();
    });
  }, []);

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
      // NOTE: Could sometimes trigger when generating messages, stopping auto-scroll mid-generation, if generation is too fast
      if (distanceFromBottom.current > 200) {
        setAutoScroll(false);
        setIsAtBottom(false);
      }

      // if the user scrolls to the bottom of this element, enable auto scroll
      if (!autoScroll && distanceFromBottom.current < 200) {
        setAutoScroll(true);
        setIsAtBottom(true);
      }
    },
    [scrollContainerRef, autoScroll],
  );

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput scrollButtonCallback={handleScrollButton} isAtBottom={isAtBottom} />
      <div className='relative flex-1 overflow-clip'>
        <div
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
      </div>
    </main>
  );
}
