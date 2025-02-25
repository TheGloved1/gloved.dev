'use client';
import { Copy } from 'lucide-react';
import React from 'react';
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
  const handleCopy = async () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <button onClick={handleCopy} title={title} className={btnClassName}>
      <Copy size={24} className={className} />
    </button>
  );
}
