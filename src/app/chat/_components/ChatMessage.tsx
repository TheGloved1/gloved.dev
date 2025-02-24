'use client'
import Markdown from '@/components/Markdown'
import { Message } from '@/db'
import { Role } from '@/lib/types'
import { Copy, SquarePen } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import Timestamp from './Timestamp'

export default function ChatMessage({
  msg,
  index,
  handleEditMessageAction,
}: {
  msg: Message
  index: number
  handleEditMessageAction: (m: Message) => void
}) {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const m = msg

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      key={index}
      className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={
          m.role === Role.USER ?
            `group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left`
          : `group relative w-full max-w-full break-words`
        }
      >
        <Markdown
          className={
            'prose prose-neutral prose-invert max-w-none prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0'
          }
        >
          {m.content}
        </Markdown>
        {m.role === Role.USER ?
          <div className='absolute right-0 mt-5 flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
            <button
              className='inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground text-xs h-8 w-8 rounded-lg bg-neutral-800/0 p-0 hover:bg-neutral-700'
              onClick={() => {
                navigator.clipboard.writeText(m.content)
                toast('✅ Successfully copied to clipboard!')
              }}
            >
              <Copy className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Copy</span>
            </button>
            <button
              onClick={() => {
                handleEditMessageAction(m)
              }}
              className='inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground text-xs h-8 w-8 rounded-lg bg-neutral-800/0 p-0 hover:bg-neutral-700'
            >
              <SquarePen className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Edit</span>
            </button>
          </div>
        : <div className='absolute left-0 mt-2 flex items-center gap-2'>
            <button
              onClick={() => {
                navigator.clipboard.writeText(m.content)
                toast.success('Copied response to clipboard!')
              }}
              className='inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 rounded-md px-3 text-xs opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'
            >
              <Copy className='-mb-0.5 -ml-0.5 !size-5' />
              Copy Response
            </button>
            <div className='opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
              {isHovered ?
                <Timestamp date={m.created_at} />
              : null}
            </div>
          </div>
        }
      </div>
    </div>
  )
}
