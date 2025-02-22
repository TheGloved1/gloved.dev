'use client'
import { toast } from '@/hooks/use-toast'
import { ClipboardCopy, Copy } from 'lucide-react'
import React, { useEffect, useState } from 'react'

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
    }
  }

  return (
    <button onClick={handleCopy} title={title}>
      <Copy size={24} className={className} />
    </button>
  )
}
