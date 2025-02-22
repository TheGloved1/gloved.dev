'use client'
import CopyButton from '@/components/CopyButton'
import Markdown from '@/components/Markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { createMessage, db, generateTitle } from '@/db'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { Role } from '@/lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bot, Loader2, MessageSquare, Send, User2 } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import React, { useLayoutEffect, useRef, useState } from 'react'

export default function Page(): React.JSX.Element {
  const { threadId } = useParams()
  if (!threadId) redirect('/chat')
  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const [loading, setLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const [rows, setRows] = useState<number>(1)

  useLiveQuery(() => {
    db.getActiveThreads().then((threads) => {
      if (threads.find((t) => t.id === threadId)) return threads
      redirect('/chat')
    })
  }, [threadId])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages =
    useLiveQuery(() => {
      return db.getThreadMessages(threadId.toString())
    }, [threadId]) ?? []

  useLayoutEffect(() => {
    // Scroll to the bottom of the chat log when the messages change
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    await handleSendMessage()
  }

  const handleSendMessage = async () => {
    if (!threadId) return

    await createMessage(threadId.toString(), input, setInput, scrollToBottom)
    setLoading(false)
    setInput('') // Clear the input
    setRows(1)
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
    <>
      <ScrollArea
        type='scroll'
        className='max-h-dvh mx-auto flex-1 p-4'
        scrollHideDelay={100}
        ref={scrollContainerRef}
      >
        <div
          className='space-y-4 pr-4 pt-4 pb-32 text-xs sm:text-sm flex-1 md:text-base'
          ref={scrollContainerRef}
        >
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start sm:justify-center'}`}
            >
              <div
                className={`group max-w-[75%] rounded-lg p-4 ${m.role === Role.USER ?
                  'bg-primary text-black min-w-28'
                  : 'bg-gray-800/0 text-white min-w-48'
                  }`}
              >
                <div
                  className={`mb-2 flex items-center gap-2 ${m.role === Role.USER ? '' : 'hidden md:flex'}`}
                >
                  {m.role === Role.USER ?
                    <User2 className='h-4 w-4' />
                    : <Bot className='h-4 w-4' />}
                  <span className='text-sm font-medium'>{m.role === Role.USER ? 'You' : 'AI'}</span>
                  <CopyButton
                    className='block size-4 text-sm text-gray-600 hover:block group-hover:block md:hidden'
                    text={m.content}
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
                  <Markdown>{m.content}</Markdown>
                </article>
              </div>
              <div ref={messagesEndRef} />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className='absolute bottom-0 z-10 mx-auto flex w-full max-w-3xl flex-col text-center'>
        <div className='fixed bottom-0 left-0 right-0 z-40 border-t border-gray-700 bg-gray-800 p-4'>
          <form onSubmit={handleSubmit} className='container mx-auto max-w-4xl'>
            <div className='flex items-center gap-2'>
              <div className='relative flex-1'>
                <MessageSquare className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                <Textarea
                  className='rounded-xl bg-gray-900 pl-10 text-gray-100'
                  value={input}
                  disabled={loading}
                  placeholder={`Enter message here... ${isMobile ? '' : '(Shift + Enter for new line)'}`}
                  rows={rows}
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
                {loading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Send className='h-4 w-4' />
                )}
                <span className='sr-only'>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
