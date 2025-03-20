'use client';
import { createMessage, dxdb } from '@/lib/dexie';
import React, { memo, useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistentState } from '@/hooks/use-persistent-state';
import Constants from '@/lib/constants';
import { ChevronDown, Loader2, Paperclip, Send, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import MobileInputDialog from './MobileInputDialog';
import ModelDropdown from './ModelDropdown';

const models = { ...Constants.ChatModels.google, ...Constants.ChatModels.groq };

const ChatBotInput = memo(
  ({
    createThread,
    scrollCallback,
    isAtBottom,
  }: {
    createThread?: boolean;
    scrollCallback?: () => void;
    isAtBottom?: boolean;
  }) => {
    const [input, setInput] = usePersistentState('input', '');
    const [imagePreview, setImagePreview] = usePersistentState<string | undefined | null>('imagePreview', null);
    const [rows, setRows] = usePersistentState<number>('rows', 2);
    const router = useRouter();
    const isMobile = useIsMobile();
    const { threadId } = useParams<{ threadId: string }>();
    const [loading, setLoading] = useState<boolean>(false);
    const [systemPrompt] = usePersistentState<string | undefined>('systemPrompt', undefined);
    const [model, setModel] = usePersistentState<string>('model', 'gemini-1.5-flash');

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

    const onModelChange = (model: string) => {
      setModel(model);
    };

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleMobileInput = () => {
      if (isMobile) {
        setIsDialogOpen(true);
      }
    };

    return (
      <div className='fixed bottom-0 z-20 w-full pr-2 md:absolute md:z-auto'>
        <div className='relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center'>
          {!isAtBottom && (
            <div className='flex justify-center pb-4'>
              <button
                type='button'
                className='flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground opacity-90 shadow-sm transition-colors hover:bg-secondary/80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                onClick={scrollCallback}
              >
                Scroll to bottom <ChevronDown />
              </button>
            </div>
          )}
          <div className='px-4'>
            <form
              onSubmit={handleSubmit}
              className='relative flex w-full flex-col items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] sm:max-w-3xl'
            >
              <div className='flex flex-grow flex-col'>
                {imagePreview && (
                  <div className='relative mb-2 h-20 w-20'>
                    <Image src={imagePreview} alt='Image preview' layout='fill' objectFit='cover' className='rounded-md' />
                    <button
                      onClick={removeImage}
                      type='button'
                      className='absolute -right-2 -top-2 rounded-full bg-neutral-800 p-1 text-neutral-200 hover:bg-neutral-700'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  </div>
                )}
                <textarea
                  className='w-full resize-none bg-transparent text-base leading-6 text-neutral-100 outline-none disabled:opacity-0'
                  style={{ height: `${(rows + 1) * 24}px` }}
                  value={input || ''}
                  disabled={loading}
                  placeholder={`Type message here...`}
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
                        <ModelDropdown models={models} selectedModel={model} onModelChange={onModelChange} />
                      </>
                    : <>
                        <ModelDropdown models={models} selectedModel={model} onModelChange={onModelChange} />
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
                  <button
                    type='submit'
                    disabled={loading || (!input && !imagePreview)}
                    className='absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-pink-600/70 p-2 text-sm font-medium text-neutral-100 shadow transition-colors hover:bg-pink-500/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
                  >
                    {loading ?
                      <Loader2 className='h-4 w-4 animate-spin' />
                    : <Send className='-mb-0.5 -ml-0.5 !size-5' />}
                    <span className='sr-only'>Send</span>
                  </button>
                </div>
              </div>
            </form>
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
ChatBotInput.displayName = 'ChatBotInput';

export default ChatBotInput;
