'use client'
import { sendMessage } from '@/lib/actions'
import { Bot, Loader2, MessageSquare, Plus, Send, User2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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

type SavedChat = {
  id: string
  name: string
  messages: Message[]
}

export default function Chatbot(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [currentChat, setCurrentChat] = useState<SavedChat | null>(null)
  const [savedChats, setSavedChats] = useState<SavedChat[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  useEffect(() => {
    if (currentChat) {
      loadChatFromLocalStorage(currentChat.id)
    }
  }, [currentChat])

  useEffect(() => {
    const storedChats = localStorage.getItem('savedChats')
    if (storedChats) {
      setSavedChats(JSON.parse(storedChats))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('savedChats', JSON.stringify(savedChats))
  }, [savedChats])

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSendMessage()
  }

  const handleSendMessage = async () => {
    setLoading(true)
    setMessages((msgs) => [...msgs, { role: Role.USER, text: input }])
    setMessages((msgs) => [...msgs, { role: Role.MODEL, text: 'Loading...' }])

    try {
      const { msg, error } = await sendMessage(input, messages)

      if (error || !msg) {
        alert(error || 'An error occurred while sending the message.')
        setMessages((msgs) => msgs.slice(0, -2)) // Remove the loading message and the user's message
      } else {
        setMessages((msgs) => {
          const updatedMessages = [...msgs]
          const loadingMessageIndex = updatedMessages.length - 1 // Index of the last message (loading message)
          updatedMessages[loadingMessageIndex] = msg // Replace loading message with the AI's response
          return updatedMessages // Return the updated messages
        })
      }
    } catch (err) {
      alert('An unexpected error occurred: ' + err)
      setMessages((msgs) => msgs.slice(0, -2)) // Remove the loading message and the user's message
    } finally {
      setLoading(false)
      setInput('') // Clear the input
    }
  }

  const handleNewChat = async () => {
    if (messages.length > 0) {
      // Generate a title based on the current messages
      const { msg: titleMessage } = await sendMessage(
        'Generate a small title for the following chat: ' + messages.map((m) => m.text).join(' '),
        messages,
      )
      if (titleMessage) {
        const chatTitle = titleMessage.text.trim() // Trim the generated title
        if (chatTitle) {
          // Check for duplicates
          const chatExists = savedChats.some((chat) => chat.name === chatTitle)
          if (!chatExists) {
            const chatId = Date.now().toString() // Generate a unique ID using timestamp
            const newChat: SavedChat = { id: chatId, name: chatTitle, messages } // Create a new SavedChat object
            setCurrentChat(newChat) // Set the generated title as the current chat name
            saveChatToLocalStorage(newChat) // Save the chat with the generated title
          }
        }
      }
    }
    setMessages([]) // Clear the messages
    setInput('') // Clear the input
  }

  const saveChatToLocalStorage = (chat: SavedChat) => {
    if (chat.name.trim()) {
      setSavedChats((prev) => [...prev, chat])
    }
  }

  const loadChatFromLocalStorage = (chatId: string) => {
    const chatData = localStorage.getItem('savedChats')
    if (chatData) {
      const parsedChat: SavedChat[] = JSON.parse(chatData)
      const chat = parsedChat.find((c) => c.id === chatId)
      if (chat) {
        setCurrentChat(chat)
      }
    }
  }

  return (
    <div className="flex min-h-dvh bg-gray-900">
      <div
        className={`collapse w-1/4 border-r border-gray-700 p-4 pt-16 ${isSidebarOpen ? 'collapse-open block' : 'hidden'} sm:block`}
      >
        <span className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-100">Saved Chats</h2>
          <button type="button" title="New chat" className="btn card bg-gray-700 hover:bg-gray-600" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </button>
        </span>
        <div className="mt-4 flex flex-col space-y-2">
          {savedChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => loadChatFromLocalStorage(chat.id)}
              className="rounded bg-gray-700 p-2 text-gray-100 hover:bg-gray-600"
            >
              {chat.name}
            </button>
          ))}
        </div>
      </div>
      <button
        className={`btn absolute start-2 flex text-white sm:hidden ${isSidebarOpen ? 'left-44 top-2' : 'left-2 top-16'}`}
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? '<-' : '->'}
      </button>
      <div className="flex-1 p-4">
        <div className="container mx-auto max-w-4xl flex-1 space-y-4 pb-32">
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
                  className={`prose max-w-none ${m.role === Role.USER ? 'prose-invert' : 'prose-invert prose-p:text-gray-100'}`}
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
                  placeholder="Type a message..."
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
    </div>
  )
}
