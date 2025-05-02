'use client';
import { createMessage, dxdb, stopGeneration } from '@/lib/dexie';
import React, { memo, useEffect, useState } from 'react';

import AdminComponent from '@/components/AdminComponent';
import { Tooltip } from '@/components/TooltipSystem';
import { Button } from '@/components/ui/button';
import { useChatOptions } from '@/hooks/use-chat-options';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Models } from '@/lib/ai';
import Constants from '@/lib/constants';
import { tryCatch, upload } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { ChevronDown, Paperclip, Send, Square, Wrench, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import { toast } from 'sonner';
import MobileInputDialog from './MobileInputDialog';
import ModelDropdown from './ModelDropdown';

const ChatInput = memo(
  ({
    createThread,
    isAtBottom,
    scrollButtonCallback = () => {},
  }: {
    createThread?: boolean;
    isAtBottom?: boolean;
    scrollButtonCallback?: () => void;
  }) => {
    const [canUpload, setCanUpload] = useState(false);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [input, setInput] = useLocalStorage('input', '');
    const { toolsEnabled, setToolsEnabled, syncEnabled, model, systemPrompt } = useChatOptions();
    const [rows, setRows] = useState<number>(2);
    const auth = useAuth();
    const isMobile = useIsMobile();
    const router = useRouter();
    const { threadId } = useParams<{ threadId: string }>();
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    const selectedModel = Models.find((m) => m.value === model) ?? null;

    const userIdIfSyncEnabled = syncEnabled && auth.userId ? auth.userId : undefined;

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setCanUpload(!!auth.userId);
    }, [auth.userId]);

    const handleSubmit = async (
      e?: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement> | undefined,
    ) => {
      e?.preventDefault();
      setLoading(true);
      let attachments: string[] | undefined;
      if (canUpload && fileInputRef.current?.files?.length) {
        const files = Array.from(fileInputRef.current.files);
        for (const file of files) {
          const imageUpload = await tryCatch(upload(file, auth.userId!));
          if (imageUpload.error) {
            toast.error('Failed to upload images');
            setLoading(false);
            return;
          }
          if (!imageUpload.data) {
            toast.error('Failed to upload images');
            setLoading(false);
            return;
          }
          attachments = [...(attachments || []), imageUpload.data];
          setImagePreview([]);
        }
        fileInputRef.current.files = null;
      }
      if (createThread) {
        const threadId = await dxdb.createThread();
        router.push('/chat/' + threadId);
        try {
          const prompt = input;
          setInput('');
          await createMessage(threadId, query || prompt, model, systemPrompt?.trim(), attachments, userIdIfSyncEnabled);
        } catch (e) {
          toast.error('Failed to generate message');
          setLoading(false);
          return;
        }
        setLoading(false);
      } else {
        const prompt = input;
        setInput('');
        await createMessage(threadId, prompt, model, systemPrompt?.trim(), attachments, userIdIfSyncEnabled);
        setLoading(false);
        setRows(2);
      }
    };

    useEffect(() => {
      if (query?.trim() && createThread) {
        handleSubmit();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, createThread]);

    useEffect(() => {
      const minRows = 2;
      const maxRows = 6;
      const newRows = input?.split('\n').length ?? 0;
      setRows(Math.min(Math.max(minRows, newRows), maxRows));
    }, [input, setRows]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files?.length) {
        const validImages: string[] = [];
        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed.');
            continue;
          }
          if (file.size > Constants.MAX_FILE_SIZE) {
            toast.error(`File size exceeds the ${Constants.FILE_SIZE_LIMIT_MB}MB limit.`);
            continue;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              validImages.push(reader.result as string);
              setImagePreview((prev) => [...(prev || []), ...validImages]);
            }
          };
          reader.readAsDataURL(file);
        }
      }
    };

    const removeImage = (index: number) => {
      setImagePreview((prev) => prev?.filter((_, i) => i !== index));
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files) {
        const dataTransfer = new DataTransfer();
        const { files } = fileInput;
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (i !== index) {
            dataTransfer.items.add(file);
          }
        }
        fileInput.files = dataTransfer.files;
      }
    };

    const handleMobileInput = () => {
      if (isMobile) {
        setIsDialogOpen(true);
      }
    };

    return (
      <div className='pointer-events-none fixed bottom-0 z-10 w-full px-2 md:absolute'>
        <div className='relative mx-auto flex w-full max-w-3xl flex-col text-center'>
          {!isAtBottom && (
            <div className='z-10 flex justify-center pb-4'>
              <button
                type='button'
                className='pointer-events-auto flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-secondary/40 bg-[--chat-overlay] px-3 text-xs font-medium text-secondary-foreground/70 backdrop-blur-xl transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-secondary/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                onClick={scrollButtonCallback}
              >
                Scroll to bottom <ChevronDown />
              </button>
            </div>
          )}
          <div className='pointer-events-none z-10'>
            <div className='pointer-events-auto'>
              <div
                className='border-reflect relative rounded-t-[20px] bg-chat-input-background p-2 pb-0 backdrop-blur-lg ![--c:--chat-input-gradient]'
                style={{
                  '--gradientBorder-gradient':
                    'linear-gradient(180deg, var(--min), var(--max), var(--min)), linear-gradient(15deg, var(--min) 50%, var(--max))',
                  '--start': '#2a2a2ae0',
                  '--opacity': '1',
                }}
              >
                <form
                  onSubmit={handleSubmit}
                  className='outline-chat-background/40 relative flex w-full flex-col items-stretch gap-2 rounded-t-xl border border-b-0 border-[hsl(0,0%,83%)]/[0.04] bg-[--chat-input-background] px-3 py-3 text-secondary-foreground outline outline-8 outline-[hsl(var(--chat-input-gradient)/0.5)] max-sm:pb-6 sm:max-w-3xl'
                  style={{
                    boxShadow:
                      'rgba(0, 0, 0, 0.1) 0px 80px 50px 0px, rgba(0, 0, 0, 0.07) 0px 50px 30px 0px, rgba(0, 0, 0, 0.06) 0px 30px 15px 0px, rgba(0, 0, 0, 0.04) 0px 15px 8px, rgba(0, 0, 0, 0.04) 0px 6px 4px, rgba(0, 0, 0, 0.02) 0px 2px 2px',
                  }}
                >
                  <div className='flex flex-grow flex-col'>
                    {imagePreview.length > 0 && (
                      <div className='flex flex-row gap-2 pb-2'>
                        {imagePreview.map((image, index) => (
                          <div key={index} className='relative h-20 w-20'>
                            <Image src={image} fill alt='Image preview' className='h-full w-full rounded-md object-cover' />
                            <button
                              onClick={() => removeImage(index)}
                              type='button'
                              className='absolute -right-2 -top-2 rounded-full bg-neutral-800 p-1 text-neutral-200 hover:bg-neutral-700'
                            >
                              <X className='h-4 w-4' />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className='flex flex-grow flex-row items-start'>
                      <textarea
                        className='w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-secondary-foreground/60 disabled:opacity-0'
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
                      <div className='-mr-0.5 -mt-0.5 flex items-center justify-center gap-2'>
                        {canUpload ?
                          <div className='px-1'>
                            <input
                              type='file'
                              ref={fileInputRef}
                              disabled={loading}
                              onChange={handleImageChange}
                              accept='image/jpeg, image/png, image/webp, image/jpg, image/gif'
                              className='hidden'
                              id='image-upload'
                            />
                            <Tooltip content='Upload image' size='sm' unselectable='on' radius='lg' animationDuration={100}>
                              <label
                                htmlFor='image-upload'
                                className='inline-flex size-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                              >
                                <Paperclip className='!size-5' />
                              </label>
                            </Tooltip>
                          </div>
                        : <div className='px-1'>
                            <input className='hidden' id='image-upload' />
                            <Tooltip
                              content='Sign in to upload images (Note: May have bugs)'
                              size='sm'
                              unselectable='on'
                              radius='lg'
                              animationDuration={100}
                            >
                              <label
                                htmlFor='image-upload'
                                className='-mb-2 inline-flex h-auto cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md px-1 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-neutral-800/40 hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                              >
                                <Paperclip className='!size-5' />
                              </label>
                            </Tooltip>
                          </div>
                        }
                        {!loading && (
                          <Button
                            title='Send Message'
                            type='submit'
                            disabled={!!!input.trim() && !!!imagePreview?.length}
                            className='border-reflect button-reflect relative inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[rgb(162,59,103)] bg-primary/20 p-2 text-sm font-semibold text-pink-50 shadow transition-colors hover:bg-[#d56698] hover:bg-pink-800/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:bg-[rgb(162,59,103)] active:bg-pink-800/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[rgb(162,59,103)] disabled:hover:bg-primary/20 disabled:active:bg-[rgb(162,59,103)] disabled:active:bg-primary/20 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                          >
                            <Send className='size-4' />
                            <span className='sr-only'>Send</span>
                          </Button>
                        )}
                        {loading && (
                          <Button
                            title='Stop'
                            type='button'
                            onClick={(e) => {
                              e.preventDefault();
                              stopGeneration();
                              setLoading(false);
                            }}
                            className='border-reflect button-reflect relative inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[rgb(162,59,103)] bg-primary/20 p-2 text-sm font-semibold text-pink-50 shadow transition-colors hover:bg-[#d56698] hover:bg-pink-800/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:bg-[rgb(162,59,103)] active:bg-pink-800/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[rgb(162,59,103)] disabled:hover:bg-primary/20 disabled:active:bg-[rgb(162,59,103)] disabled:active:bg-primary/20 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                          >
                            <Square className='size-4 rounded bg-current' />
                            <span className='sr-only'>Stop Generation</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 md:flex-row md:items-center'>
                    <div className='z-50 ml-[-7px] flex items-center gap-1'>
                      <ModelDropdown />
                      {selectedModel?.features.tools ?
                        <AdminComponent fallback={<></>}>
                          <Button
                            title={`AI can create and upload files for you (Experimental)`}
                            variant='ghost'
                            type='button'
                            className={`${toolsEnabled ? 'bg-muted/40 hover:bg-muted/80' : 'bg-muted/0 hover:bg-muted/10'} -mb-1.5 inline-flex h-auto items-center justify-center gap-2 whitespace-nowrap rounded-full border border-solid border-secondary-foreground/10 px-3 py-1.5 pl-2 pr-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`}
                            onClick={() => {
                              setToolsEnabled(!toolsEnabled);
                              if (!toolsEnabled) toast.info('Tools Enabled');
                              if (toolsEnabled) toast.info('Tools Disabled');
                            }}
                          >
                            <Wrench className='size-4' />
                            Tools
                          </Button>
                        </AdminComponent>
                      : null}
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
