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
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const distanceFromBottom = useRef<number>(0);
  const scrollBottom = useIntersectionObserver({
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

  const scrollToBottom = useCallback(() => {
    if (!autoScroll) return;
    /* console.log(
        'Scrolling to bottom',
        scrollContainer.current?.scrollTop,
        lastScrollTop.current,
        distanceFromBottom.current,
      ); */
    scrollBottom.entry?.target.scrollIntoView({
      behavior: 'instant',
    });
  }, [autoScroll, scrollBottom.entry?.target]);

  const handleScrollButton = () => {
    if (!autoScroll) {
      /* console.log(
        'Auto scroll enabled',
        scrollContainer.current?.scrollTop,
        lastScrollTop.current,
        distanceFromBottom.current,
      ); */
      setAutoScroll(true);
      scrollBottom.entry?.target.scrollIntoView({
        behavior: 'instant',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    sleep(500).then(() => {
      scrollToBottom();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useInterval(
    () => {
      scrollToBottom();
    },
    autoScroll ? 500 : null,
  );

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput
        scrollButtonCallback={handleScrollButton}
        scrollCallback={scrollToBottom}
        isAtBottom={scrollBottom.isIntersecting}
      />
      <div className='relative flex-1 overflow-clip'>
        <div
          onScroll={(e) => {
            // If user scrolls up, disable auto scroll. If user scrolls to bottom, enable auto scroll
            if (!scrollContainer.current) return;
            distanceFromBottom.current =
              scrollContainer.current.scrollHeight - (scrollContainer.current.scrollTop || e.currentTarget.scrollTop) - 988;
            // NOTE: Could sometimes trigger when generating messages, stopping auto-scroll mid-generation, if generation is too fast
            if (distanceFromBottom.current > 200) {
              /* console.log(
                'Auto scroll disabled',
                scrollContainer.current?.scrollTop,
                lastScrollTop.current,
                distanceFromBottom.current,
              ); */
              setAutoScroll(false);
            }

            // if the user scrolls to the bottom of this element, enable auto scroll
            if (!autoScroll && distanceFromBottom.current < 200) {
              /* console.log(
                'Auto scroll enabled',
                scrollContainer.current?.scrollTop,
                lastScrollTop.current,
                distanceFromBottom.current,
              ); */
              setAutoScroll(true);
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
          <div id='scroll-bottom' ref={scrollBottom.ref} className='mt-6 h-0 w-0' />
        </div>
      </div>
    </main>
  );
}
