'use client';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { useInterval } from '@/hooks/use-interval';
import { dxdb } from '@/lib/dexie';
import { sleep } from '@/lib/utils';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChatInput from '../_components/ChatInput';
import ChatMessage from '../_components/ChatMessage';

export const dynamic = 'force-static';

export default function Page(): React.JSX.Element {
  const router = useRouter();
  const { threadId } = useParams<{ threadId: string }>();
  const scrollContainer = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef<number>(100000);
  const [autoScroll, setAutoScroll] = useState(true);
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

  const scrollToBottom = useCallback(
    (noSmooth?: boolean) => {
      if (!autoScroll) return;
      entry?.target.scrollIntoView({
        behavior: noSmooth ? 'instant' : 'smooth',
      });
    },
    [entry?.target, autoScroll],
  );

  const handleScrollButton = () => {
    if (!autoScroll) {
      // console.log('Auto scroll enabled');
      setAutoScroll(true);
      entry?.target.scrollIntoView({
        behavior: 'instant',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    lastScrollTop.current = 1000000;
    sleep(500).then(() => {
      scrollToBottom();
    });
  }, [scrollToBottom]);

  useInterval(() => {
    scrollToBottom();
  }, 500);

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput scrollButtonCallback={handleScrollButton} scrollCallback={scrollToBottom} isAtBottom={isAtBottom} />
      <div className='relative flex-1 overflow-clip'>
        <div
          onScroll={(e) => {
            // If user scrolls up, disable auto scroll
            const offset = 25;
            const scrollTop = scrollContainer.current?.scrollTop || e.currentTarget.scrollTop;
            if (autoScroll && lastScrollTop.current !== null && lastScrollTop.current > scrollTop + offset) {
              // console.log('Auto scroll disabled', scrollContainer.current?.scrollTop, lastScrollTop.current);
              setAutoScroll(false);
            }

            // if the user scrolls to the bottom of this element, enable auto scroll
            if (scrollContainer.current) {
              const isAtBottom = scrollContainer.current.scrollHeight - scrollTop <= scrollContainer.current.clientHeight;
              if (!autoScroll && isAtBottom) {
                // console.log('Auto scroll enabled', scrollContainer.current?.scrollTop, lastScrollTop.current);
                setAutoScroll(true);
              }
            }
            lastScrollTop.current = scrollContainer.current?.scrollTop || e.currentTarget.scrollTop;
          }}
          ref={scrollContainer}
          className='scrollbar-w-2 h-[100dvh] overflow-y-auto overflow-x-clip pb-32 scrollbar-thin scrollbar-track-transparent'
        >
          <div className='mx-auto flex w-full max-w-3xl translate-x-1 flex-col space-y-12 p-4 pb-16 text-sm'>
            {messages.map((message) => {
              return <ChatMessage scrollEditCallback={scrollToBottom} message={message} key={message.id} />;
            })}
          </div>
          <div id='scroll-bottom' ref={ref} className='mt-6 h-0 w-0' />
        </div>
      </div>
    </main>
  );
}
