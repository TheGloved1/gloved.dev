'use client'
import { toast } from '@/hooks/use-toast'
import { Copy } from 'lucide-react'
import React from 'react'

interface CopyButtonProps {
  text: string
  className?: string
  title?: string
}

export default function CopyButton({
  text = 'Copied!',
  className,
  title = 'Copy message',
}: CopyButtonProps): React.JSX.Element {
  const handleCopy = async () => {
    try {
      navigator.clipboard.writeText(text)
      toast({
        duration: 1000,
        description: '✅ Successfully copied to clipboard!',
      })
    } catch (err) {
      console.warn('Copy to clipboard failed', err)
      toast({
        duration: 1000,
        description: '❌ Failed to copy to clipboard!',
      })
    }
  }

  return (
    <button onClick={handleCopy} title={title}>
      <Copy size={24} className={className} />
    </button>
  )
}
