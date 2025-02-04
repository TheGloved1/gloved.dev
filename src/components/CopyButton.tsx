import React, { useState } from 'react'
import { ClipboardCopy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, className }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <div>
      <button onClick={handleCopy} disabled={copied} className={cn('mx-2 text-gray-600', className)} title="Copy message">
        {!copied && <ClipboardCopy />}
        {copied && <span className="p-2 text-sm text-green-500">Copied!</span>}
      </button>
    </div>
  )
}

export default CopyButton
