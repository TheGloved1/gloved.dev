/* eslint-disable @next/next/no-img-element */
'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface ImageViewerProps {
  selectedImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  progress: { progress: number; stage: string } | null;
  copyFeedback: boolean;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCopyImage: () => void;
}

export const ImageViewer = memo(function ImageViewer({
  selectedImage,
  processedImage,
  isProcessing,
  progress,
  copyFeedback,
  onFileInput,
  onCopyImage,
}: ImageViewerProps) {
  return (
    <div className='grid min-h-0 flex-1 grid-cols-2 gap-3'>
      {/* Original image - clickable to replace */}
      <label
        htmlFor='file-upload-replace'
        className='group relative min-h-0 cursor-pointer overflow-hidden border border-white/10 bg-black transition-all hover:border-white/30'
      >
        <input type='file' accept='image/*' onChange={onFileInput} className='hidden' id='file-upload-replace' />
        <div className='checkerboard absolute inset-0' />
        {selectedImage && <img src={selectedImage} alt='Original' className='relative h-full w-full object-contain' />}
        <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
          <div className='text-center'>
            <svg className='mx-auto h-6 w-6 text-white/80' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
              />
            </svg>
            <p className='font-mono-industrial mt-1 text-[10px] text-white/80'>REPLACE</p>
          </div>
        </div>
        <div className='font-mono-industrial absolute bottom-2 left-2 z-10 border border-white/20 bg-black/80 px-2 py-0.5 text-[10px] uppercase'>
          ORIGINAL
        </div>
      </label>

      {/* Processed image */}
      <div
        className={cn(
          'group relative min-h-0 overflow-hidden border border-white/10 bg-black transition-all',
          processedImage && 'cursor-pointer hover:border-fuchsia-500/50',
        )}
        onClick={processedImage ? onCopyImage : undefined}
      >
        <div className='checkerboard absolute inset-0' />

        {processedImage ?
          <>
            <img src={processedImage} alt='Processed' className='relative h-full w-full object-contain' />
            <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
              <div className='text-center'>
                {copyFeedback ?
                  <>
                    <svg className='mx-auto h-6 w-6 text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                    </svg>
                    <p className='font-mono-industrial mt-1 text-[10px] text-green-400'>COPIED!</p>
                  </>
                : <>
                    <svg className='mx-auto h-6 w-6 text-white/80' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                    <p className='font-mono-industrial mt-1 text-[10px] text-white/80'>COPY</p>
                  </>
                }
              </div>
            </div>
          </>
        : isProcessing ?
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <div className='relative mb-4 h-16 w-16 border border-fuchsia-500/30'>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className='absolute inset-1 border-2 border-transparent border-t-fuchsia-500'
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className='absolute inset-3 border-2 border-transparent border-b-fuchsia-500/50'
              />
            </div>
            {progress && (
              <div className='w-32 space-y-2'>
                <div className='h-1 overflow-hidden bg-white/10'>
                  <motion.div
                    className='h-full bg-fuchsia-500'
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                  />
                </div>
                <div className='font-mono-industrial text-center text-[10px]'>
                  <span className='text-white/50'>{progress.stage}</span>
                </div>
              </div>
            )}
          </div>
        : <div className='absolute inset-0 flex items-center justify-center'>
            <p className='font-mono-industrial text-[10px] text-white/30'>RESULT</p>
          </div>
        }

        {processedImage && (
          <div className='font-mono-industrial absolute bottom-2 left-2 z-10 border border-fuchsia-500/50 bg-black/80 px-2 py-0.5 text-[10px] uppercase text-fuchsia-400'>
            EXTRACTED
          </div>
        )}
      </div>
    </div>
  );
});
