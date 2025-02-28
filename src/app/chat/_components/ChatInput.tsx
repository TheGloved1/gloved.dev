'use client';
import { createMessage, db } from '@/db';
import React, { memo, useMemo } from 'react';

import { usePersistentState } from '@/hooks/use-persistent-state';
import Constants from '@/lib/constants';
import { SHA256 } from 'crypto-js';
import ImageCompressor from 'image-compressor.js';
import { ChevronDown, Loader2, Paperclip, Send, X } from 'lucide-react';
import NextImage from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ModelDropdown from './ModelDropdown';

const models = { ...Constants.ChatModels.google, ...Constants.ChatModels.groq };

const ChatBotInput = memo(
  ({
    input,
    setInputAction: setInput,
    imagePreview,
    setImagePreviewAction: setImagePreview,
    createThread,
    scrollCallback,
    isAtBottom,
  }: {
    input: string;
    setInputAction: React.Dispatch<React.SetStateAction<string>>;
    imagePreview?: string | null;
    setImagePreviewAction: React.Dispatch<React.SetStateAction<string | undefined | null>>;
    createThread?: boolean;
    scrollCallback?: () => void;
    isAtBottom?: boolean;
  }) => {
    const router = useRouter();
    const { threadId } = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [rows, setRows] = useState<number>(1);
    const [model, setModel] = usePersistentState<string>('model', 'gemini-1.5-flash');

    // Used to store the hashes of the compressed images to avoid re-compression
    const [compressedImageHashes, setCompressedImageHashes] = usePersistentState<string[]>('compressedImageHashes', []);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const dataURLtoFile = useMemo(
      () => (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length; // Changed to let
        const u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
      },
      [],
    );

    const convertFileToBase64 = useMemo(
      () =>
        async (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = async () => {
              const dataUrl = reader.result as string;

              // Create a hash of the data URL
              const hash = SHA256(dataUrl).toString();

              // Check if the hash already exists
              if (compressedImageHashes.includes(hash)) {
                console.log('Hash already exists, skipping compression:', hash);
                resolve(dataUrl);
                return;
              }

              // Check if the file is a GIF
              const EXCLUDED_IMAGE_TYPES = new Set(['image/gif', 'image/apng']);
              if (EXCLUDED_IMAGE_TYPES.has(file.type)) {
                console.log('Excluding file type:', file.type);
                resolve(dataUrl); // Return the Base64 directly for animated images
                return;
              }

              const inKB = (size: number) => (size / 1024).toFixed(2);

              // Log the original file size
              console.log('Original file size:', inKB(file.size), 'KB');

              // Use image-compressor.js to compress the image
              new ImageCompressor(file, {
                convertSize: 10000,
                quality: 0.05,
                success(result) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    // The result will be a Base64 string
                    const compressedDataUrl = reader.result as string;
                    const hash = SHA256(compressedDataUrl).toString();
                    setCompressedImageHashes((prev) => [...prev, hash]);
                    resolve(compressedDataUrl);
                  };
                  reader.onerror = (error) => {
                    console.error('Error reading blob:', error);
                    reject(error);
                  };

                  // Log the new compressed file size
                  console.log('Compressed file size:', inKB(result.size), 'KB');

                  // Read the Blob as a Data URL
                  reader.readAsDataURL(result);
                },
                error(err) {
                  console.error(err);
                  reject(err);
                },
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        },
      [compressedImageHashes, setCompressedImageHashes],
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setLoading(true);
      setImagePreview(null);
      let imageBase64: string | null = null;
      if (fileInputRef.current?.files?.[0]) {
        imageBase64 = await convertFileToBase64(fileInputRef.current.files[0]);
      }
      if (createThread) {
        const threadId = await db.createThread({
          title: Date.now().toString(),
        });
        router.push('/chat/' + threadId);
        try {
          await createMessage(threadId, input, model, setInput, imageBase64, scrollCallback);
        } catch (e) {
          toast.error('Failed to generate message');
          setLoading(false);
          return;
        }
        setLoading(false);
      } else {
        if (!threadId || typeof threadId !== 'string') return;

        await createMessage(threadId, input, model, setInput, imageBase64, scrollCallback);
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
      const newRows = input.split('\n').length;
      setRows(Math.min(Math.max(minRows, newRows), maxRows));
    }, [input]);

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

    useEffect(() => {
      const addBase64ImageToInput = (base64Image: string) => {
        const file = dataURLtoFile(base64Image, 'image.png');
        const fileList = new DataTransfer();
        fileList.items.add(file);
        fileInputRef.current!.files = fileList.files;
      };
      if (!imagePreview) return;
      setImagePreview(imagePreview);
      addBase64ImageToInput(imagePreview);
    }, [dataURLtoFile, imagePreview, setImagePreview]);

    return (
      <div className='absolute bottom-0 w-full pr-2'>
        <div className='relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center'>
          {!isAtBottom && (
            <div className='flex justify-center pb-4'>
              <button
                type='button'
                className='justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 text-xs flex items-center gap-2 rounded-full opacity-90 hover:opacity-100'
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
                    <NextImage
                      src={imagePreview}
                      alt='Image preview'
                      layout='fill'
                      objectFit='cover'
                      className='rounded-md'
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
                <textarea
                  className='w-full resize-none bg-transparent text-base leading-6 text-neutral-100 outline-none disabled:opacity-0'
                  style={{ height: `${(rows + 1) * 24}px` }}
                  value={input}
                  disabled={loading}
                  placeholder={`Type message here...`}
                  rows={rows}
                  onChange={(e) => {
                    setInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      setInput((prev) => prev + '\n');
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
                    <ModelDropdown models={models} selectedModel={model} onModelChange={onModelChange} />
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
                      className='inline-flex items-center -translate-y-1.5 justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-neutral-800/40 rounded-md text-xs h-auto gap-2 px-2 py-1.5 text-muted-foreground hover:text-neutral-300 -mb-2 cursor-pointer'
                    >
                      <Paperclip className='!size-5' />
                    </label>
                  </div>
                  <button
                    type='submit'
                    disabled={loading || (!input && !imagePreview)}
                    className='inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 w-9 absolute bottom-3 right-3 rounded-full bg-pink-600/70 p-2 text-neutral-100 hover:bg-pink-500/70'
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
      </div>
    );
  },
);
ChatBotInput.displayName = 'ChatBotInput';

export default ChatBotInput;
