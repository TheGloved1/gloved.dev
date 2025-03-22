'use client';
import ErrorAlert from '@/components/ErrorAlert';
import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { useTextToSpeech } from '@/hooks/use-tts';
import { dxdb, Message, updateMessage } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import { Copy, RefreshCcw, Send, SquarePen, Volume2Icon, VolumeXIcon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';
import Timestamp from './Timestamp';

export default memo(function ChatMessage({
  message,
  scrollEditCallback,
}: {
  message: Message;
  scrollEditCallback: () => void;
}) {
  const { threadId } = useParams<{ threadId: string }>();
  const [input, setInput] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [, , getSystemPrompt] = usePersistentState<string | undefined>('systemPrompt', undefined);
  const [, , getModel] = usePersistentState<string>('model', 'gemini-2.0-flash');
  const [speak, stopSpeech, isSpeaking] = useTextToSpeech();

  const handleEditMessage = useCallback(
    async (m: Message) => {
      const { data, error } = await tryCatch(dxdb.getThreadMessages(threadId)); // Get all messages in the thread
      if (error) return;
      const allMessages = data;
      const index = allMessages.findIndex((msg) => msg.id === m.id); // Find the index of the deleted message

      // Delete all subsequent messages
      for (let i = index + 1; i < allMessages.length; i++) {
        await dxdb.removeMessage(allMessages[i].id);
      }
    },
    [threadId],
  );

  if (message.status === 'error') return <ErrorAlert>Error: Something went wrong, please try again.</ErrorAlert>;
  if (message.content.trim() === '') return <div>...</div>;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      key={message.id}
      id={message.id}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={
          message.role === 'user' ?
            input !== null ?
              `group relative w-full max-w-[80%] rounded-2xl bg-[#2D2D2D] p-4 text-left`
            : `group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left`
          : `group relative w-full max-w-full break-words`
        }
      >
        {message.role === 'user' && input !== null ?
          <>
            <textarea
              className='flex min-h-[100px] w-full rounded-md border border-none border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={message.content}
              rows={5}
            />
            <div className='mt-4 flex items-center justify-end gap-2'>
              <Button
                variant='ghost'
                className='inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-xs font-medium transition-colors hover:bg-neutral-800/40 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                onClick={() => {
                  setInput(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-pink-600/70 p-2 text-sm font-medium text-neutral-100 shadow transition-colors hover:bg-pink-500/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                disabled={!input}
                onClick={async () => {
                  await handleEditMessage(message);
                  await updateMessage(
                    message,
                    input,
                    getModel(),
                    () => {
                      scrollEditCallback();
                      setInput(null);
                    },
                    getSystemPrompt(),
                  );
                }}
              >
                <Send className='-mb-0.5 -ml-0.5 !size-5' />
                <span className='sr-only'>Send</span>
              </Button>
            </div>
          </>
        : <>
            <Markdown
              className={
                'prose prose-sm prose-neutral prose-invert max-w-none text-white prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0'
              }
            >
              {message.content}
            </Markdown>
          </>
        }
        {message.role === 'user' && input === null && (
          <div className='absolute right-0 mt-5 flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
            <button
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-neutral-800/0 p-0 text-xs font-medium transition-colors hover:bg-neutral-700 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
              onClick={async () => {
                await handleEditMessage(message);
                await updateMessage(
                  message,
                  message.content,
                  getModel(),
                  () => {
                    scrollEditCallback();
                  },
                  getSystemPrompt(),
                );
              }}
              title='Retry'
            >
              <RefreshCcw className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Retry</span>
            </button>
            <button
              onClick={() => {
                setInput(message.content);
              }}
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-neutral-800/0 p-0 text-xs font-medium transition-colors hover:bg-neutral-700 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
              title='Edit'
            >
              <SquarePen className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Edit</span>
            </button>
            <button
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-neutral-800/0 p-0 text-xs font-medium transition-colors hover:bg-neutral-700 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
              onClick={() => {
                navigator.clipboard.writeText(message.content);
                toast.success('Copied response to clipboard!');
              }}
              title='Copy'
            >
              <Copy className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Copy</span>
            </button>
          </div>
        )}
        {message.role === 'assistant' && (
          <div className='absolute left-0 mt-2 flex items-center gap-2'>
            {!isSpeaking ?
              <button
                className='inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground opacity-0 shadow-sm transition-opacity hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                title='Speak message'
                onClick={() => {
                  speak(message.content);
                }}
              >
                <Volume2Icon className='-ml-0.5!size-5 -mb-0.5' />
              </button>
            : <button
                className='inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-destructive/80 px-3 text-xs font-medium text-destructive-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                title='Stop speaking'
                onClick={() => {
                  stopSpeech();
                }}
              >
                <VolumeXIcon className='-ml-0.5!size-5 -mb-0.5' />
              </button>
            }
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.content);
                toast.success('Copied response to clipboard!');
              }}
              className='inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground opacity-0 shadow-sm transition-opacity hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
            >
              <Copy className='-mb-0.5 -ml-0.5 !size-5' />
              Copy Response
            </button>
            <div className='opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
              {isHovered ?
                <Timestamp date={new Date(message.created_at)} model={message.model} />
              : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
