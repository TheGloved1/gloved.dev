'use client'
import { sendMessage } from '@/lib/actions'
import { Bot, Loader2, MessageSquare, Send, User2 } from 'lucide-react'
import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Input } from '@/components/Input'

enum Role {
  USER = 'user',
  MODEL = 'model',
}

type Message = {
  role: Role
  text: string
}

export default function Chatbot(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSendMessage()
  }

  const handleSendMessage = async () => {
    setLoading(true)
    setMessages((msgs) => [...msgs, { role: Role.USER, text: input }])
    setMessages((msgs) => [...msgs, { role: Role.MODEL, text: 'Loading...' }])
    const { message: msg, error } = await sendMessage(input, messages)

    if (error || !msg) {
      alert(error)
      setMessages((msgs) => msgs.slice(0, -2))
    } else {
      setMessages((msgs) => msgs.slice(0, -1))
      setMessages((msgs) => [...msgs, msg])
    }

    setInput('')
    setLoading(false)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-gray-900">
      <div className="container mx-auto max-w-4xl flex-1 space-y-4 p-4 pb-32">
        {messages.map((m, index) => (
          <div key={index} className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                m.role === Role.USER ? 'bg-primary text-black' : 'bg-gray-800 text-white'
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                {m.role === Role.USER ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                <span className="text-sm font-medium">{m.role === Role.USER ? 'You' : 'AI'}</span>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
              <article
                className={`prose max-w-none ${
                  m.role === Role.USER
                    ? 'prose-invert prose-p:text-black prose-headings:text-black prose-strong:text-black prose-li:text-black'
                    : 'prose-invert prose-p:text-gray-100 prose-headings:text-gray-100 prose-strong:text-gray-100 prose-li:text-gray-100'
                }`}
              >
                <Markdown>{m.text}</Markdown>
              </article>
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-800 p-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                className="flex-1 border-gray-700 bg-gray-900 pl-10 text-gray-100"
                value={input}
                disabled={loading}
                placeholder="Say Hi..."
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading || !input.trim()} className="btn bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
