'use client'
import CopyButton from '@/components/CopyButton'
import Markdown from '@/components/Markdown'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { createMessage, db, Message } from '@/db'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { Role } from '@/lib/types'
import { useLiveQuery } from 'dexie-react-hooks'
import { Bot, Loader2, MessageSquare, Send, SquarePen, User2 } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import React, { useRef, useState } from 'react'

export default function Page(): React.JSX.Element {
  const { threadId } = useParams()
  if (!threadId || typeof threadId !== 'string') redirect('/chat')

  const isMobile = useIsMobile()
  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const [loading, setLoading] = useState<boolean>(false)
  const [rows, setRows] = useState<number>(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useLiveQuery(() => {
    db.getThreads().then((threads) => {
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
  const messages = useLiveQuery(() => db.getThreadMessages(threadId.toString()), [threadId]) ?? []

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    if (!threadId) return

    await createMessage(threadId, input, setInput, scrollToBottom)
    scrollToBottom()
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

  const handleEditMessage = async (m: Message) => {
    const messageContent = m.content // Get the content of the message to be deleted
    const allMessages = await db.getThreadMessages(threadId) // Get all messages in the thread
    const index = allMessages.findIndex((msg) => msg.id === m.id) // Find the index of the deleted message

    // Delete all subsequent messages
    await db.removeMessage(m.id)
    for (let i = index + 1; i < allMessages.length; i++) {
      await db.removeMessage(allMessages[i].id)
    }

    setInput(messageContent) // Set the input field to the content of the deleted message
  }

  return (
    <div className='relative flex flex-col flex-grow overflow-y-hidden'>
      <ScrollArea
        type='scroll'
        className='mx-auto flex-1 max-w-3xl overflow-hidden'
        scrollHideDelay={100}
        ref={scrollContainerRef}
      >
        <div
          className='space-y-4 px-1 pt-4 pb-32 max-w-3xl text-xs sm:text-sm flex-1 md:text-base'
          ref={scrollContainerRef}
        >
          {messages.map((m, index) => (
            <div
              key={index}
              className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start sm:justify-center'}`}
            >
              <div
                className={`group rounded-lg p-2 ${
                  m.role === Role.USER ?
                    'bg-primary text-black min-w-40 max-w-[75%] pr-2'
                  : 'bg-gray-800/0 text-white max-w-[100%] px-2'
                }`}
              >
                <div className={`mb-2 flex items-center gap-2`}>
                  {m.role === Role.USER ?
                    <User2 size={16} />
                  : <Bot size={16} />}
                  <span className='text-sm font-medium'>{m.role === Role.USER ? 'You' : 'AI'}</span>
                  {m.role === Role.USER ?
                    <button onClick={() => handleEditMessage(m)} title='Edit message'>
                      <SquarePen className='block p-0.5 rounded hover:bg-gray-400/80 size-5 text-sm text-gray-800 hover:block group-hover:block md:hidden' />
                    </button>
                  : null}
                  <CopyButton
                    className='block p-1 rounded hover:bg-gray-400/80 size-5 text-sm text-gray-800 hover:block group-hover:block md:hidden'
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
              <div ref={messagesEndRef} className='w-0 h-0 overflow-hidden' />
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className='md:relative fixed bottom-0 mx-auto flex w-full max-w-3xl flex-col text-center max-h-60 md:max-h-80'>
        <div className='md:relative fixed md:rounded-t-xl bottom-0 left-0 right-0 z-40 border-t max-w-3xl border-gray-700 bg-gray-800 p-4 min-w-2xl'>
          <form onSubmit={handleSubmit} className='container mx-auto max-w-4xl'>
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
