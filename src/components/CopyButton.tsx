'use client'
import { ClipboardCopy } from 'lucide-react'
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
  const [copied, setCopied] = useState<boolean>(false)

  const handleCopy = async () => {
    try {
      navigator.clipboard.writeText(text)
      setCopied(true)
    } catch (err) {
      console.warn('Copy to clipboard failed', err)
    }
  }

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [copied])

  return (
    <div>
      <button onClick={handleCopy} disabled={copied} title={title}>
        {!copied && (
          <div className={className}>
            <ClipboardCopy />
          </div>
        )}
        {copied && <span className='text-sm text-green-500'>Copied!</span>}
      </button>
    </div>
  )
}
