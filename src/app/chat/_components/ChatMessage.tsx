'use client';
import ErrorAlert from '@/components/ErrorAlert';
import LoadingSvg from '@/components/LoadingSvg';
import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTextToSpeech } from '@/hooks/use-tts';
import { defaultModel } from '@/lib/ai';
import { dxdb, Message, updateMessage } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import equal from 'fast-deep-equal';
import { ChevronDown, ChevronUp, Copy, RefreshCcw, Send, SquarePen, Volume2Icon, VolumeXIcon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { memo, useCallback, useState } from 'react';
import { toast } from 'sonner';
import Timestamp from './Timestamp';

const renderImages = (attachments?: string[]) => {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className='flex flex-row gap-1'>
      {attachments.map((attachment, index) => {
        return <Image width={150} height={150} className='my-4 rounded-lg' key={index} src={attachment} alt='Attachment' />;
      })}
    </div>
  );
};

function ChatMessage({ message, scrollEditCallback }: { message: Message; scrollEditCallback: () => void }) {
  const [input, setInput] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showReasoning, setShowReasoning] = useState<boolean>(false);
  const { threadId } = useParams<{ threadId: string }>();
  const [systemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const [model] = useLocalStorage<string>('model', defaultModel);
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
  if (
    message.content.trim() === '' &&
    !message.attachments &&
    (!message.reasoning || message.reasoning.trim() === '') &&
    message.status === 'streaming'
  )
    return (
      <div key={message.id} id={message.id}>
        <LoadingSvg />
      </div>
    );

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
              `group relative w-full max-w-[80%] rounded-xl border border-secondary/50 bg-secondary/50 p-4 text-left`
            : `group relative inline-block max-w-[80%] break-words rounded-xl border border-secondary/50 bg-secondary/50 px-4 py-3 text-left`

          : `group relative w-full max-w-full break-words`
        }
      >
        {renderImages(message.attachments)}
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
                    model,
                    () => {
                      scrollEditCallback();
                      setInput(null);
                    },
                    systemPrompt,
                  );
                }}
              >
                <Send className='-mb-0.5 -ml-0.5 !size-5' />
                <span className='sr-only'>Send</span>
              </Button>
            </div>
          </>
        : <>
            {message.reasoning && message.reasoning?.trim() !== '' ?
              <div className='mb-2 flex items-center gap-2'>
                <button
                  onClick={() => setShowReasoning(!showReasoning)}
                  className='inline-flex items-center gap-2 rounded-md bg-secondary/0 px-3 py-1 text-sm font-medium text-secondary-foreground hover:bg-secondary/80'
                >
                  <span>Reasoning</span>
                  {showReasoning ?
                    <ChevronUp className='-mb-0.5 -ml-0.5 !size-4' />
                  : <ChevronDown className='-mb-0.5 -ml-0.5 !size-4' />}
                </button>
              </div>
            : null}
            {message.reasoning && message.reasoning?.trim() !== '' ?
              showReasoning ?
                <div className='mb-4 rounded-lg bg-neutral-800/20 p-3'>
                  <Markdown className='prose prose-sm prose-neutral prose-invert max-w-none text-foreground prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0'>
                    {message.reasoning}
                  </Markdown>
                </div>
              : null
            : null}
            <Markdown
              className={
                'prose prose-sm prose-neutral prose-invert max-w-none text-foreground prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0'
              }
            >
              {message.content}
            </Markdown>
          </>
        }
        {message.role === 'user' && input === null && (
          <div className='absolute right-0 mt-5 flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
            <button
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg p-0 text-xs font-medium transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
              onClick={async () => {
                await handleEditMessage(message);
                await updateMessage(
                  message,
                  message.content,
                  model,
                  () => {
                    scrollEditCallback();
                  },
                  systemPrompt,
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
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg p-0 text-xs font-medium transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
              title='Edit'
            >
              <SquarePen className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Edit</span>
            </button>
            <button
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg p-0 text-xs font-medium transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
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
}

export default memo(ChatMessage, (prevProps, nextProps) => {
  if (!equal(prevProps.message, nextProps.message)) return false;
  return true;
});
