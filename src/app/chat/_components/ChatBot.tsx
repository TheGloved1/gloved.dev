'use client'
import { createMessage, db } from '@/db'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { redirect } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import ChatBotInput from './ChatBotInput'

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
      <ChatBotInput createThread={true} />
      <div className='relative flex-1 overflow-hidden'>
        <div className='scrollbar scrollbar-w-2 scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-600 h-[100dvh] overflow-y-auto pb-36'>
          <div className='mx-auto flex w-full max-w-2xl flex-col space-y-12 p-3 translate-x-1 pb-8 text-sm'></div>
        </div>
      </div>
    </main>
  )
}
