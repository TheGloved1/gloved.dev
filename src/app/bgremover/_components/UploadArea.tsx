'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useBGRemover } from './BGRemoverContext';

export const UploadArea = memo(function UploadArea() {
  const { fileInputRef, dragActive, handleFileInput, handleDrag, handleDrop } = useBGRemover();
  return (
    <motion.div
      key='upload'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className='flex h-full items-center justify-center'
    >
      <div
        className={cn(
          'group relative h-full w-full max-w-4xl border-2 border-dashed transition-all duration-300',
          dragActive ? 'border-fuchsia-500 bg-fuchsia-500/5' : 'border-white/20 hover:border-white/40',
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type='file'
          accept='image/png,image/jpeg,image/jpg,image/webp'
          onChange={handleFileInput}
          title={``}
          className='absolute inset-0 z-10 cursor-pointer opacity-0'
          id='file-upload'
        />

        {/* Corner decorations */}
        <div className='absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-fuchsia-500' />
        <div className='absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-fuchsia-500' />
        <div className='absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-fuchsia-500' />
        <div className='absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-fuchsia-500' />

        <div className='flex h-full flex-col items-center justify-center p-8'>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='mb-6 flex h-20 w-20 items-center justify-center border border-white/10 bg-white/5'
          >
            <svg className='h-10 w-10 text-white/30' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='square'
                strokeWidth={1}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='text-center'
          >
            <h2 className='font-display text-2xl font-bold uppercase tracking-tight lg:text-3xl'>DROP YOUR IMAGE</h2>
            <p className='font-mono-industrial mt-3 text-xs text-white/50'>CLICK ANYWHERE • PASTE WITH CTRL+V</p>
            <div className='font-mono-industrial mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] text-white/30'>
              <span className='border border-white/10 px-2 py-1'>JPG</span>
              <span className='border border-white/10 px-2 py-1'>PNG</span>
              <span className='border border-white/10 px-2 py-1'>WEBP</span>
            </div>
          </motion.div>
        </div>

        {dragActive && (
          <motion.div
            initial={{ top: 0 }}
            animate={{ top: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className='absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent'
          />
        )}
      </div>
    </motion.div>
  );
});
