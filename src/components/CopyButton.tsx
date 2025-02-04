import React, { useState } from 'react'
import { ClipboardCopy } from 'lucide-react'

interface CopyButtonProps {
  text: string
  className?: string
  title?: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ text, className, title = 'Copy message' }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <div>
      <button onClick={handleCopy} disabled={copied} title={title}>
        {!copied && (
          <div className={className}>
            <ClipboardCopy />
          </div>
        )}
        {copied && <span className="text-sm text-green-500">Copied!</span>}
      </button>
    </div>
  )
}

export default CopyButton
