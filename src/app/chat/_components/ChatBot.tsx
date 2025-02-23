'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { createMessage, db } from '@/db'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { toast } from '@/hooks/use-toast'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { redirect } from 'next/navigation'
import React, { useState } from 'react'

export default function ChatBot(): React.JSX.Element {
  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const [loading, setLoading] = useState<boolean>(false)
  const [rows, setRows] = useState<number>(1)
  const isMobile = useIsMobile()

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    setLoading(true)
    const threadId = await db.createThread({
      title: 'Chat-' + Date.now().toString(),
    })
    try {
      createMessage(threadId.toString(), input, setInput)
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to generate message',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }
    setLoading(false)
    redirect('/chat/' + threadId.toString())
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)

    const lineHeight = 24
    const minRows = 1
    const maxRows = 5
    const newRows = Math.min(
      Math.max(minRows, Math.floor(e.target.scrollHeight / lineHeight)),
      maxRows,
    )
    setRows(newRows)
  }

  return (
    <div className='relative flex flex-col flex-grow overflow-y-hidden h-dvh'>
      <ScrollArea
        type='scroll'
        className='mx-auto w-full min-w-96 flex-1 max-w-3xl overflow-hidden'
        scrollHideDelay={100}
      ></ScrollArea>
      <div className='md:relative min-w-[100%] fixed bottom-0 mx-auto flex w-full max-w-3xl flex-col text-center max-h-60 md:max-h-80'>
        <div className='md:relative fixed md:rounded-t-xl min-w-96 bottom-0 left-0 right-0 z-40 border-t max-w-3xl border-gray-700 bg-gray-800 p-4'>
          <form onSubmit={handleSubmit} className='container mx-auto min-w-96 max-w-4xl'>
            <div className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <MessageSquare className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Textarea
                  className='rounded-xl bg-gray-900 pl-10 text-gray-100'
                  value={input}
                  disabled={loading}
                  placeholder={`Type message here...`}
                  rows={rows}
                  aria-rowcount={rows}
                  onChange={handleTextareaChange}
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
              <button
                type='submit'
                disabled={loading || !input}
                className='btn bg-primary hover:bg-primary/90'
              >
                {loading ?
                  <Loader2 className='h-4 w-4 animate-spin' />
                : <Send className='h-4 w-4' />}
                <span className='sr-only'>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
