'use client';
import { dxdb, formatContent, generateTitle, Message } from '@/dexie';
import { tryCatch } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { useLiveQuery } from 'dexie-react-hooks';
import nextDynamic from 'next/dynamic';
import { redirect, useParams } from 'next/navigation';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ChatBotInput from '../_components/ChatInput';
import ChatMessage from '../_components/ChatMessage';

export const dynamic = 'force-static';

function ThreadPage(): React.JSX.Element {
  const { threadId } = useParams();
  if (!threadId || typeof threadId !== 'string') redirect('/chat');
  const [input, setInput] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | undefined | null>();
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();

  async function checkSync(userId: string) {
    const lastSync = localStorage.getItem('lastSync');
    const now = new Date().getTime();

    // If lastRun is null or more than 1 minute (60000 milliseconds) has passed
    if (!lastSync || now - Number(lastSync) > 60000) {
      // Your function logic here
      console.log('[SYNC] Syncing...');
      await dxdb.syncDexie(userId);
      console.log('[SYNC] Synced!');

      // Update the last run time in local storage
      localStorage.setItem('lastSync', now.toString());
    } else {
      console.log('[SYNC] Function has run recently. Skipping...');
    }
  }

  useEffect(() => {
    dxdb.getThreads().then((threads) => {
      if (threads.find((t) => t.id === threadId)) return threads;
      redirect('/chat');
    });
  }, [threadId]);

  const scrollToBottom = useCallback((noSmooth?: boolean) => {
    messagesEndRef.current?.scrollIntoView({ behavior: noSmooth ? 'auto' : 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

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

  const handleEditMessage = useCallback(
    async (m: Message) => {
      const { content, image } = formatContent(m.content);
      const { data, error } = await tryCatch(dxdb.getThreadMessages(threadId)); // Get all messages in the thread
      if (error) return;
      const allMessages = data;
      const index = allMessages.findIndex((msg) => msg.id === m.id); // Find the index of the deleted message

      // Delete all subsequent messages
      await dxdb.removeMessage(m.id);
      for (let i = index + 1; i < allMessages.length; i++) {
        await dxdb.removeMessage(allMessages[i].id);
      }

      // Regenerate the title
      generateTitle(threadId);

      setInput(content ?? ''); // Set the input field to the content of the deleted message
      setImagePreview(image);
    },
    [threadId],
  );

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

  useEffect(() => {
    if (isAtBottom && messages) scrollToBottom();
  }, [messages, isAtBottom, scrollToBottom]);

  // Initial scroll to bottom (after component mounts and data is available)
  useEffect(() => {
    if (messages) scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatBotInput
        input={input}
        setInputAction={setInput}
        imagePreview={imagePreview}
        setImagePreviewAction={setImagePreview}
        scrollCallback={scrollToBottom}
        isAtBottom={isAtBottom}
      />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600'>
          <div className='mx-auto flex w-full max-w-3xl translate-x-1 flex-col space-y-12 p-4 pb-8 text-sm'>
            {messages.map((message) => (
              <ChatMessage message={message} key={message.id} handleEditMessageAction={handleEditMessage} />
            ))}
          </div>
          <div ref={messagesEndRef} className='h-0 w-0' />
        </div>
      </div>
    </main>
  );
}

export default nextDynamic(() => Promise.resolve(memo(ThreadPage)), { ssr: false });
