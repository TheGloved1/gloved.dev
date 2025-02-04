import React, { useState } from 'react';
import { ClipboardCopy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000); // Hide the notification after 1 second
  };

  return (
    <div>
      <button
        onClick={handleCopy}
        className={cn('text-gray-600', className)}
        title="Copy message"
      >
        <ClipboardCopy />
      </button>
      {copied && (
        <span className="p-2 text-sm text-green-500">
          Copied!
        </span>
      )}
    </div>
  );
};

export default CopyButton;