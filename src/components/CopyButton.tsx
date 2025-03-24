'use client';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface CopyButtonProps {
  text: string;
  className?: string;
  title?: string;
  btnClassName?: string;
}

export default function CopyButton({
  text = 'Copied!',
  className,
  title = 'Copy message',
  btnClassName,
}: CopyButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} disabled={copied} title={title} className={btnClassName}>
      {copied ?
        <Check width={24} height={24} className={cn('!size-4 text-green-500', className)} />
      : <Copy width={24} height={24} className={cn('!size-4', className)} />}
    </button>
  );
}
