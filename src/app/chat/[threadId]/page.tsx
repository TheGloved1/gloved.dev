'use client'
import { createMessage, db, generateTitle, Message } from '@/db'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { tryCatch } from '@/lib/utils'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronDown, Loader2, Send } from 'lucide-react'
import { redirect, useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import ChatMessage from '../_components/ChatMessage'

export default function Page(): React.JSX.Element {
  const { threadId } = useParams()
  if (!threadId || typeof threadId !== 'string') redirect('/chat')

  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const [loading, setLoading] = useState<boolean>(false)
  const [rows, setRows] = useState<number>(1)
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    db.getThreads().then((threads) => {
      if (threads.find((t) => t.id === threadId)) return threads
      redirect('/chat')
    })
  }, [threadId])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  const messages =
    useLiveQuery(() => {
      scrollToBottom()
      return db.getThreadMessages(threadId)
    }, [threadId, db.messages]) ?? []

  useEffect(() => {
    scrollToBottom()
  }, [])

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    e.preventDefault()
    if (!threadId) return

    await createMessage(threadId, input, setInput, scrollToBottom)
    setLoading(false)
    setInput('')
    setRows(1)
  }

  useEffect(() => {
    // Count how many rows the textarea is by getting all '\n' in the input
    const minRows = 2
    const maxRows = 6
    const newRows = input.split('\n').length
    setRows(Math.min(Math.max(minRows, newRows), maxRows))
  }, [input])

  const handleEditMessage = async (m: Message) => {
    const messageContent = m.content // Get the content of the message to be deleted
    const { data, error } = await tryCatch(db.getThreadMessages(threadId)) // Get all messages in the thread
    if (error) return
    const allMessages = data
    const index = allMessages.findIndex((msg) => msg.id === m.id) // Find the index of the deleted message

    // Delete all subsequent messages
    await db.removeMessage(m.id)
    for (let i = index + 1; i < allMessages.length; i++) {
      await db.removeMessage(allMessages[i].id)
    }

    // Regenerate the title
    generateTitle(threadId)

    setInput(messageContent) // Set the input field to the content of the deleted message
  }

  useEffect(() => {
    const msgEndRef = messagesEndRef?.current
    const observer = new IntersectionObserver(
      (entries) => {
        setIsAtBottom(entries[0].isIntersecting)
      },
      { root: null, rootMargin: '0px', threshold: 1 },
    )
    if (msgEndRef) {
      observer.observe(msgEndRef)
    }
    return () => {
      if (msgEndRef) {
        observer.unobserve(msgEndRef)
      }
    }
  }, [messagesEndRef])

  return (
    <main className='relative flex w-full flex-1 flex-col'>
      <div className='absolute bottom-0 w-full pr-2'>
        <div className='relative z-10 mx-auto flex w-full max-w-3xl flex-col text-center'>
          {!isAtBottom && (
            <div className='flex justify-center pb-4'>
              <button
                type='button'
                className='justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 text-xs flex items-center gap-2 rounded-full opacity-90 hover:opacity-100'
                onClick={() => {
                  messagesEndRef.current?.scrollIntoView()
                }}
              >
                Scroll to bottom <ChevronDown />
              </button>
            </div>
          )}
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
          <div className='mx-auto flex w-full max-w-3xl flex-col space-y-12 p-4 translate-x-1 pb-8 text-sm'>
            {messages.map((m, index) => (
              <ChatMessage msg={m} key={index} handleEditMessageAction={handleEditMessage} />
            ))}
          </div>
          <div ref={messagesEndRef} className='w-0 h-0' />
        </div>
      </div>
    </main>
  )
}
