'use client';
import { createMessage, dxdb } from '@/lib/dexie';
import React, { memo, useEffect, useState } from 'react';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import Constants from '@/lib/constants';
import { ChevronDown, Loader2, Paperclip, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useRef } from 'react';
import { toast } from 'sonner';
import MobileInputDialog from './MobileInputDialog';
import ModelDropdown from './ModelDropdown';

const ChatInput = memo(
  ({
    createThread,
    scrollCallback,
    isAtBottom,
  }: {
    createThread?: boolean;
    scrollCallback?: () => void;
    isAtBottom?: boolean;
  }) => {
    const [input, setInput] = useLocalStorage('input', '');
    const [imagePreview, setImagePreview] = useLocalStorage<string | undefined | null>('imagePreview', null);
    const [rows, setRows] = useLocalStorage<number>('rows', 2);
    const router = useRouter();
    const isMobile = useIsMobile();
    const { threadId } = useParams<{ threadId: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
    const [model, setModel] = useLocalStorage<string>('model', Constants.ChatModels.default);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const canUpload = false;

    const handleSubmit = async (e?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
      e?.preventDefault();
      setLoading(true);
      if (createThread) {
        const threadId = await dxdb.createThread();
        router.push('/chat/' + threadId);
        try {
          await createMessage(threadId, input, model, setInput, scrollCallback, systemPrompt?.trim());
        } catch (e) {
          toast.error('Failed to generate message');
          setLoading(false);
          return;
        }
        setLoading(false);
      } else {
        await createMessage(threadId, input, model, setInput, scrollCallback, systemPrompt?.trim());
        setLoading(false);
        setInput('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setRows(2);
      }
    };

    useEffect(() => {
      const minRows = 2;
      const maxRows = 6;
      const newRows = input?.split('\n').length ?? 0;
      setRows(Math.min(Math.max(minRows, newRows), maxRows));
    }, [input, setRows]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          toast.error('Only image files are allowed.');
          return;
        }
        if (file.size > Constants.MAX_FILE_SIZE) {
          toast.error(`File size exceeds the ${Constants.FILE_SIZE_LIMIT_MB}MB limit.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const removeImage = () => {
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleMobileInput = () => {
      if (isMobile) {
        setIsDialogOpen(true);
      }
    };

    return (
      <div className='fixed bottom-0 z-10 w-full px-2 md:absolute md:z-auto'>
        <div className='relative mx-auto flex w-full max-w-3xl flex-col text-center'>
          {!isAtBottom && (
            <div className='z-10 flex justify-center pb-4'>
              <button
                type='button'
                className='pointer-events-auto flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-secondary/40 bg-primary px-3 text-xs font-medium text-secondary-foreground/70 backdrop-blur-xl transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 dark:bg-primary/70 dark:text-secondary-foreground/70 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                onClick={scrollCallback}
              >
                Scroll to bottom <ChevronDown />
              </button>
            </div>
          )}
          <div className='pointer-events-none z-10'>
            <div className='pointer-events-auto'>
              <div
                className='dark:border-reflect dark:rounded-t-[20px] dark:bg-background/40 dark:p-2 dark:pb-0 dark:backdrop-blur-lg'
                /* style={{
                  '--gradientBorder-gradient':
                    'linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))',
                  '--start': '#2a2a2ae0',
                  '--opacity': '1',
                }} */
              >
                <form
                  onSubmit={handleSubmit}
                  className='dark:outline-chat-background/90 relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-white/30 bg-[#3030309c] px-3 py-3 text-secondary-foreground outline outline-4 outline-[hsl(0,0%,63%)]/5 dark:border-[hsl(0,0%,83%)]/[0.04] dark:bg-background/40 sm:max-w-3xl'
                  style={{
                    boxShadow:
                      'rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px',
                  }}
                >
                  <div className='flex flex-grow flex-col'>
                    {imagePreview && (
                      <div className='relative mb-2 h-20 w-20'>
                        <Image
                          src={imagePreview}
                          fill
                          alt='Image preview'
                          className='h-full w-full rounded-md object-cover'
                        />
                        <button
                          onClick={removeImage}
                          type='button'
                          className='absolute -right-2 -top-2 rounded-full bg-neutral-800 p-1 text-neutral-200 hover:bg-neutral-700'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                    )}
                    <div className='flex flex-grow flex-row items-start'>
                      <textarea
                        className='w-full resize-none bg-transparent pr-10 text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0'
                        style={{ height: `${(rows + 1) * 24}px` }}
                        value={input || ''}
                        disabled={loading}
                        placeholder='Type message here...'
                        rows={rows}
                        onFocus={handleMobileInput}
                        onChange={(e) => {
                          setInput(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            setInput(input + '\n');
                          } else if (e.key === 'Enter') {
                            if (!input.trim() && !imagePreview) {
                              e.preventDefault();
                              return;
                            }
                            handleSubmit(e);
                          }
                        }}
                      />
                      <button
                        type='submit'
                        disabled={loading || (!input.trim() && !imagePreview)}
                        className='border-reflect button-reflect relative inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[rgb(162,59,103)] p-2 text-sm font-semibold text-pink-50 shadow transition-colors hover:bg-[#d56698] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:bg-[rgb(162,59,103)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                      >
                        {input.trim() ?
                          loading ?
                            <Loader2 className='size-4 animate-spin' />
                          : <Send className='!size-4' />
                        : <X className='!size-4 opacity-50' />}
                        <span className='sr-only'>Send</span>
                      </button>
                    </div>
                    <div className='flex flex-col gap-2 md:flex-row md:items-center'>
                      <div className='flex items-center gap-1'>
                        {isMobile ?
                          <>
                            {canUpload && (
                              <>
                                <input
                                  type='file'
                                  ref={fileInputRef}
                                  onChange={handleImageChange}
                                  accept='image/jpeg, image/png, image/webp'
                                  className='hidden'
                                  id='image-upload'
                                />
                                <label
                                  htmlFor='image-upload'
                                  className='-mb-2 inline-flex h-auto -translate-y-1.5 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-neutral-800/40 hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                                >
                                  <Paperclip className='!size-5' />
                                </label>
                              </>
                            )}
                            <ModelDropdown />
                          </>
                        : <>
                            <ModelDropdown />
                            {canUpload && (
                              <>
                                <input
                                  type='file'
                                  ref={fileInputRef}
                                  onChange={handleImageChange}
                                  accept='image/jpeg, image/png, image/webp'
                                  className='hidden'
                                  id='image-upload'
                                />
                                <label
                                  htmlFor='image-upload'
                                  className='-mb-2 inline-flex h-auto -translate-y-1.5 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-neutral-800/40 hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                                >
                                  <Paperclip className='!size-5' />
                                </label>
                              </>
                            )}
                          </>
                        }
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <MobileInputDialog
          input={input}
          setInput={setInput}
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          onSubmit={(message) => {
            // Handle the message submission here
            handleSubmit();
          }}
          rows={rows}
        />
      </div>
    );
  },
);
ChatInput.displayName = 'ChatInput';

export default ChatInput;
