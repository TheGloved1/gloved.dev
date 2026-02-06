'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';

interface ProcessingControlsProps {
  isProcessing: boolean;
  hasProcessedImage: boolean;
  onProcess: () => void;
  onCancel: () => void;
}

export const ProcessingControls = memo(function ProcessingControls({
  isProcessing,
  hasProcessedImage,
  onProcess,
  onCancel,
}: ProcessingControlsProps) {
  if (isProcessing) {
    return (
      <div className="flex gap-2">
        <Button
          disabled
          className="brutal-shadow font-display h-10 flex-1 cursor-not-allowed border-2 border-fuchsia-500 bg-fuchsia-500 text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-fuchsia-400 disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 animate-pulse bg-fuchsia-500" />
            <span>PROCESSING</span>
          </div>
        </Button>
        <Button
          onClick={onCancel}
          className="brutal-shadow-sm font-mono-industrial h-10 flex-shrink-0 border-2 border-red-500 bg-red-500 px-4 text-[10px] uppercase tracking-wider text-white transition-all hover:bg-red-400"
        >
          <svg className="mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          CANCEL
        </Button>
      </div>
    );
  }

  if (hasProcessedImage) {
    return (
      <Button
        onClick={onProcess}
        className="brutal-shadow font-display h-10 w-full flex-shrink-0 border-2 border-fuchsia-500 bg-fuchsia-500 text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-fuchsia-400 disabled:opacity-50"
      >
        REPROCESS
      </Button>
    );
  }

  return (
    <Button
      onClick={onProcess}
      disabled={isProcessing}
      className="brutal-shadow font-display h-10 w-full flex-shrink-0 border-2 border-fuchsia-500 bg-fuchsia-500 text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-fuchsia-400 disabled:opacity-50"
    >
      <span>EXTRACT SUBJECT</span>
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
});
