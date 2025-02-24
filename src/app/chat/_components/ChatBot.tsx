'use client'
import { createMessage, db } from '@/db'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { Loader2, Send } from 'lucide-react'
import { redirect } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'

export default function ChatBot(): React.JSX.Element {
  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const [loading, setLoading] = useState<boolean>(false)
  const [rows, setRows] = useState<number>(1)

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    setLoading(true)
    const threadId = await db.createThread({
      title: Date.now().toString(),
    })
    try {
      createMessage(threadId.toString(), input, setInput)
    } catch (e) {
      toast.error('Failed to generate message')
      setLoading(false)
      return
    }
    setLoading(false)
    redirect('/chat/' + threadId.toString())
  }

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <div className='absolute bottom-0 w-full pr-2'>
        <div className='relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center'>
          <div className='px-4'>
            <form
              onSubmit={handleSubmit}
              className='relative flex w-full flex-col items-stretch gap-2 rounded-t-xl bg-[#2D2D2D] px-3 py-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] sm:max-w-3xl'
            >
              <div className='flex flex-grow flex-col'>
                <textarea
                  className='w-full resize-none bg-transparent text-base leading-6 text-neutral-100 outline-none disabled:opacity-0'
                  style={{ height: `${(rows + 1) * 24}px` }}
                  value={input}
                  disabled={loading}
                  placeholder={`Type message here...`}
                  rows={rows}
                  onChange={(e) => {
                    setInput(e.target.value)
                  }}
                  onKeyDown={(e) => {
                    // If Shift + Enter is pressed, add a new line
                    if (e.key === 'Enter' && e.shiftKey) {
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
              <div className='flex flex-col gap-2 md:flex-row md:items-center'>
                <button
                  type='submit'
                  disabled={loading || !input}
                  className='inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 w-9 absolute bottom-3 right-3 rounded-full bg-pink-600/70 p-2 text-neutral-100 hover:bg-pink-500/70'
                >
                  {loading ?
                    <Loader2 className='h-4 w-4 animate-spin' />
                  : <Send className='-mb-0.5 -ml-0.5 !size-5' />}
                  <span className='sr-only'>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar scrollbar-w-2 scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600 h-[100dvh] overflow-y-auto pb-36'>
          <div className='mx-auto flex w-full max-w-2xl flex-col space-y-12 p-3 translate-x-1 pb-8 text-sm'></div>
        </div>
      </div>
    </main>
  )
}
