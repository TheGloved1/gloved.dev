'use client'
import { Textarea } from '@/components/ui/textarea'
import { createMessage, db, generateTitle } from '@/db'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { toast } from '@/hooks/use-toast'
import { MessageSquare, Send } from 'lucide-react'
import { redirect } from 'next/navigation'
import React, { useRef } from 'react'

export default function ChatBot(): React.JSX.Element {
  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    const threadId = await db.createThread({
      title: 'Chat-' + Date.now().toString(),
    })
    try {
      generateTitle(threadId.toString())
      createMessage(threadId.toString(), input, setInput)
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to generate message',
        variant: 'destructive',
      })
    }
    redirect('/chat/' + threadId.toString())
  }

  return (
    <div className='mx-auto max-w-7xl flex-1 p-4'>
      <div className='space-y-4 pb-32'>
        {/* {messages.map((m, index) => (
          <div
            key={index}
            className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`group max-w-[75%] rounded-lg p-4 ${m.role === Role.USER ? 'bg-primary text-black' : 'bg-gray-800 text-white'
                }`}
            >
              <div className='mb-2 flex items-center gap-2'>
                {m.role === Role.USER ?
                  <User2 className='h-4 w-4' />
                  : <Bot className='h-4 w-4' />}
                <span className='text-sm font-medium'>
                  {m.role === Role.USER ? 'You' : 'AI'}
                </span>
                <CopyButton
                  className='block size-4 text-sm text-gray-600 hover:block group-hover:block md:hidden'
                  text={m.text}
                  title='Copy raw message'
                />
              </div>
              {loading && (
                <div className='flex items-center gap-2 text-white'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='text-sm'>Thinking...</span>
                </div>
              )}
              <article
                className={`prose max-w-none ${m.role === Role.USER ? 'prose-invert' : 'prose-invert prose-p:text-gray-100'}`}
              >
                <Markdown>{m.text}</Markdown>
              </article>
            </div>
          </div>
        ))} */}
        <div ref={messagesEndRef} />
      </div>
      <div className='fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 bg-gray-800 p-4'>
        <form onSubmit={handleSubmit} className='container mx-auto max-w-4xl'>
          <div className='flex items-center gap-2'>
            <div className='relative flex-1'>
              <MessageSquare className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
              <Textarea
                className='rounded-xl bg-gray-900 pl-10 text-gray-100'
                value={input}
                placeholder={`Enter message here... ${isMobile ? '' : '(Shift + Enter for new line)'}`}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' && e.shiftKey) || e.ctrlKey) {
                    e.preventDefault()
                    setInput((prev) => prev + '\n')
                  } else if (e.key === 'Enter') {
                    if (!input.trim()) {
                      e.preventDefault()
                      return
                    }
                    handleSubmit(e)
                  }
                }}
              />
            </div>
            <button
              type='submit'
              disabled={!input.trim()}
              className='btn bg-primary hover:bg-primary/90'
            >
              <Send className='h-4 w-4' />
              <span className='sr-only'>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
