'use client'
import { usePersistentState } from '@/hooks/use-persistent-state'
import React, { useEffect, useState } from 'react'
import ChatBotInput from './_components/ChatBotInput'

export default function ChatBot(): React.JSX.Element {
  const [input, setInput] = usePersistentState<string>('chatInput', '')
  const [loading, setLoading] = useState<boolean>(false)
  const [rows, setRows] = usePersistentState<number>('chatRows', 2)

  useEffect(() => {
    // Count how many rows the textarea is by getting all '\n' in the input
    const minRows = 2
    const maxRows = 6
    const newRows = input.split('\n').length
    setRows(Math.min(Math.max(minRows, newRows), maxRows))
  }, [input, rows, setRows])

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
