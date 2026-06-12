'use client';
import { useChat } from '@/hooks/use-chat';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import ChatInput from './_components/ChatInput';

const WelcomeContent = dynamic(() => import('./_components/WelcomeContent'), { ssr: false });

export default function Page(): React.JSX.Element {
  const { getInput } = useChat();
  const input = getInput('__new__').input;

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <ChatInput createThread={true} isAtBottom={true} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar-w-2 h-[100dvh] overflow-y-auto pb-36 scrollbar scrollbar-track-transparent scrollbar-thumb-gray-700 hover:scrollbar-thumb-gray-600'>
          <div className='pt-safe-offset-10 mx-auto flex w-full max-w-3xl flex-col space-y-12 px-4 pb-10'>
            <div className='flex h-[calc(100vh-20rem)] items-center justify-center'>
              <AnimatePresence>
                {!input && (
                  <motion.div
                    key='welcome'
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className='w-full px-2 sm:px-8'
                  >
                    <Suspense fallback={null}>
                      <WelcomeContent />
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
