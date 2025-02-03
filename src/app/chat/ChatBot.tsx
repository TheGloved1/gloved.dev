'use client'
import { sendMessage } from '@/lib/actions'
import { Bot, Loader2, MessageSquare, Plus, RefreshCcw, Send, User2 } from 'lucide-react'
import * as React from 'react'
import Markdown from 'react-markdown'
import { Input } from '@/components/Input'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import PageBack from '@/components/PageBack'

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
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState<string>('')
  const [loading, setLoading] = React.useState<boolean>(false)
  const [currentChat, setCurrentChat] = React.useState<SavedChat | null>(null)
  const [savedChats, setSavedChats] = React.useState<SavedChat[]>([])

  React.useEffect(() => {
    if (currentChat) {
      loadChatFromLocalStorage(currentChat.id)
    }
  }, [currentChat])

  React.useEffect(() => {
    const storedChats = localStorage.getItem('savedChats')
    if (storedChats) {
      setSavedChats(JSON.parse(storedChats))
    }
  }, [])

  React.useEffect(() => {
    localStorage.setItem('savedChats', JSON.stringify(savedChats))
  }, [savedChats])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSendMessage()
  }

  const handleSendMessage = async () => {
    setLoading(true)
    setMessages((msgs) => [...msgs, { role: Role.USER, text: input }, { role: Role.MODEL, text: 'Loading...' }])

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
          const chatExists = savedChats.some((chat) => chat?.name === chatTitle)
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
    if (chat?.name.trim()) {
      setSavedChats((prev) => [...prev, chat])
    }
  }

  const loadChatFromLocalStorage = (chatId: string) => {
    const chatData = localStorage.getItem('savedChats')
    if (chatData) {
      const parsedChat: SavedChat[] = JSON.parse(chatData)
      const chat = parsedChat.find((chat) => chat?.id === chatId)
      if (chat) {
        setCurrentChat(chat)
      }
    }
  }

  return (
    <div className="flex min-h-dvh w-dvw mx-auto">
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <PageBack stayTop noFixed btnClassName="btn card bg-gray-700 hover:bg-gray-600" />
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuButton
                  type="button"
                  title="New chat"
                  className="btn card bg-gray-700 hover:bg-gray-600"
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New chat</span>
                </SidebarMenuButton>
                {savedChats?.map((item) => (
                  <SidebarMenuItem key={item?.name}>
                    <SidebarMenuButton onClick={() => setCurrentChat(item)} asChild>
                      {item?.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="p-4">
        <SidebarTrigger />
      </div>
      <div className="flex-1 p-4 mx-auto max-w-7xl">
        <div className="space-y-4 pb-32">
          {messages.map((m, index) => (
            <div key={index} className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg p-4 ${m.role === Role.USER ? 'bg-primary text-black' : 'bg-gray-800 text-white'
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
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 bg-gray-800 p-4">
          <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
            <div className="flex gap-2">
              <button
                type="button"
                title="Restart Chat"
                className="btn card bg-gray-700 hover:bg-gray-600"
                onClick={() => {
                  setCurrentChat(null)
                  setMessages([])
                }}
                disabled={!messages.length || loading}
              >
                <span className="sr-only">Restart Chat</span>
                <RefreshCcw className="h-4 w-4" />
              </button>
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
