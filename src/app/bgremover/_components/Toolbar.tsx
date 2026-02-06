'use client';

import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { memo } from 'react';
import { useBGRemover } from './BGRemoverContext';

export const Toolbar = memo(function Toolbar() {
  const { isProcessing, processedImage, resetAll, downloadImage } = useBGRemover();
  const hasProcessedImage = !!processedImage;
  return (
    <div className='mb-3 flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3'>
      <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          onClick={resetAll}
          className='font-mono-industrial h-8 border border-white/10 px-3 text-[10px] uppercase tracking-wider hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
        >
          <X className='mr-1.5 h-3 w-3' />
          CLEAR
        </Button>

        {hasProcessedImage && (
          <Button
            onClick={downloadImage}
            className='brutal-shadow-sm font-mono-industrial h-8 border-2 border-fuchsia-500 bg-fuchsia-500 px-4 text-[10px] uppercase tracking-wider text-black transition-all hover:bg-fuchsia-400'
          >
            <Download className='mr-1.5 h-3 w-3' />
            DOWNLOAD
          </Button>
        )}
      </div>

      <div className='font-mono-industrial text-[10px] text-white/40'>
        {isProcessing ?
          <span className='flex items-center gap-2'>
            <span className='h-1.5 w-1.5 animate-pulse bg-fuchsia-500' />
            PROCESSING
          </span>
        : hasProcessedImage ?
          <span className='text-green-400'>✓ COMPLETE</span>
        : 'READY'}
      </div>
    </div>
  );
});
