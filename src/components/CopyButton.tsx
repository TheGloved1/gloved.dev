'use client';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from './ui/button';

interface CopyButtonProps {
  text: string;
  className?: string;
  title?: string;
  btnClassName?: string;
}

export default function CopyButton({
  text = 'Copied!',
  className,
  title = 'Copy',
  btnClassName,
}: CopyButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeClass = 'scale-100 opacity-100';
  const inactiveClass = 'scale-0 opacity-0';

  return (
    <div className='sticky left-auto top-6 z-[1] ml-auto h-1.5 w-8 transition-[top]'>
      <Button
        onClick={handleCopy}
        disabled={copied}
        title={title}
        variant='ghost'
        className={cn(
          'absolute -top-[34px] right-1 inline-flex size-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary p-2 text-xs font-medium transition-colors hover:bg-muted-foreground/10 hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 dark:hover:bg-muted-foreground/5 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-all [&_svg]:duration-200',
          btnClassName,
        )}
      >
        <div className='relative size-4'>
          <Copy
            className={cn(
              `ease-snappy absolute inset-0 !size-4 transition-all duration-200 ${!copied ? activeClass : inactiveClass}`,
              className,
            )}
          />
          <Check
            className={cn(
              `ease-snappy absolute inset-0 !size-4 text-green-500 transition-all duration-200 ${copied ? activeClass : inactiveClass}`,
              className,
            )}
          />
        </div>
      </Button>
    </div>
  );
}
