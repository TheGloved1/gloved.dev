'use client'
import CopyButton from '@/components/CopyButton'
import PageBack from '@/components/PageBack'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { sendMessage } from '@/lib/actions'
import { Bot, Loader2, MessageSquare, Plus, RefreshCcw, Send, User2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'

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
  const [messages, setMessages] = usePersistentState<Message[]>('messages', [])
  const [savedChats, setSavedChats] = usePersistentState<SavedChat[]>('savedChats', [])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    // Scroll to the bottom of the chat log when the messages change
    scrollToBottom()
  }, [messages])

  /**
   * Handles the submission of the chat input form by preventing the default
   * form submission behavior and calling `handleSendMessage` to send the
   * message to the server.
   * @param e The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSendMessage()
  }

  /**
   * Handles sending a message to the server by adding a loading message to the
   * chat log, sending the message to the server, and updating the chat log with
   * the server's response.
   *
   * If there is an error, an alert will be shown with the error message. If the
   * server responds with an error message, the error message will be shown in an
   * alert. If the server does not respond with an error message, the AI's
   * response will be added to the chat log.
   */
  const handleSendMessage = async () => {
    setLoading(true)
    setMessages((msgs) => [...msgs, { role: Role.USER, text: input }, { role: Role.MODEL, text: '...' }])

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

  /**
   * Handles the creation of a new chat by generating a title for the current
   * chat messages, checking for duplicates, and saving the chat to local
   * storage if it does not already exist. Clears the current messages and input
   * after processing.
   */
  const handleNewChat = async () => {
    setLoading(true)
    if (messages.length > 0) {
      // Generate a title based on the current messages
      const { msg: titleMessage, error } = await sendMessage(
        'Generate a small title for the following chat: ' + messages.map((m) => m.text).join(' \n'),
        messages,
      )

      if (error || !titleMessage || !titleMessage.text.trim()) {
        alert(error || 'An error occurred while generating a title for the chat.')
        setLoading(false)
      } else {
        const chatTitle = titleMessage.text.trim()
        const chatId = Date.now().toString() // Generate a unique ID using timestamp
        const newChat: SavedChat = { id: chatId, name: chatTitle, messages } // Create a new SavedChat object
        setSavedChats((prev) => [...prev, newChat])
        setLoading(false)
      }
    }
    setMessages([]) // Clear the messages
    setInput('') // Clear the input
  }

  const loadChatFromLocalStorage = (chatId: string) => {
    const chatData = localStorage.getItem('savedChats')
    if (chatData) {
      const parsedChat: SavedChat[] = JSON.parse(chatData)
      const chat = parsedChat.find((chat) => chat?.id === chatId)
      if (chat) {
        setMessages(chat.messages)
        setSavedChats(savedChats.filter((chat) => chat.id !== chatId))
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-dvw">
      <Sidebar>
        <SidebarContent className="bg-gradient-to-bl from-gray-200 to-gray-600">
          <SidebarHeader>
            <PageBack stayTop noFixed btnClassName="btn bg-gray-700 hover:bg-gray-600" />
          </SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel className="font-bold text-black">Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuButton
                  type="button"
                  title="New chat"
                  className="btn card rounded-xl bg-gray-700 hover:bg-gray-600"
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New chat</span>
                </SidebarMenuButton>
                {savedChats?.map((item) => (
                  <SidebarMenuItem key={item?.name}>
                    <SidebarMenuButton onClick={() => loadChatFromLocalStorage(item?.id)}>{item?.name}</SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="p-2">
        <SidebarTrigger className="fixed left-2 top-2 z-50" />
      </div>
      <div className="mx-auto max-w-7xl flex-1 p-4">
        <div className="space-y-4 pb-32">
          {messages.map((m, index) => (
            <div key={index} className={`flex ${m.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] group rounded-lg p-4 cursor-pointer select-none ${m.role === Role.USER ? 'bg-primary text-black' : 'bg-gray-800 text-white'
                  }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  {m.role === Role.USER ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  <span className="text-sm font-medium">{m.role === Role.USER ? 'You' : 'AI'}</span>
                  <CopyButton className="block md:hidden group-hover:block hover:block text-sm p-0 m-0 text-gray-600" text={m.text} />
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
          <div ref={messagesEndRef} />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 bg-gray-800 p-4">
          <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Restart Chat"
                className="btn card bg-gray-700 hover:bg-gray-600"
                onClick={() => {
                  setMessages([])
                }}
                disabled={!messages.length || loading}
              >
                <span className="sr-only">Restart Chat</span>
                <RefreshCcw className="h-4 w-4" />
              </button>
              <div className="relative flex-1">
                <MessageSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Textarea
                  className="rounded-xl bg-gray-900 pl-10 text-gray-100"
                  value={input}
                  disabled={loading}
                  placeholder="Enter message here..."
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading || !input.trim()} className="btn bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
