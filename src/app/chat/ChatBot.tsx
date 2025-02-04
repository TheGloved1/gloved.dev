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
  SidebarHeader,
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
  const [savedChats, setSavedChats] = React.useState<SavedChat[]>([])
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    // Load saved chats from local storage
    const storedChats = localStorage.getItem('savedChats')
    if (storedChats) {
      console.log('Saving chats:', JSON.parse(storedChats))
      setSavedChats(JSON.parse(storedChats))
    }
  }, [])

  React.useEffect(() => {
    // Save chats to local storage when they change
    localStorage.setItem('savedChats', JSON.stringify(savedChats))
  }, [savedChats])

  React.useEffect(() => {
    // Save messages to local storage when they change
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages))
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  React.useEffect(() => {
    // Load messages from local storage
    const storedMessages = localStorage.getItem('messages')
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }
  }, [])

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

  /**
   * Handles the creation of a new chat by generating a title for the current
   * chat messages, checking for duplicates, and saving the chat to local
   * storage if it does not already exist. Clears the current messages and input
   * after processing.
   */
  const handleNewChat = async () => {
    if (messages.length > 0) {
      // Generate a title based on the current messages
      const { msg: titleMessage } = await sendMessage(
        'Generate a small title for the following chat: ' + messages.map((m) => m.text).join(' \n'),
        messages,
      )
      if (titleMessage) {
        const chatTitle = titleMessage.text.trim() // Trim the generated title
        if (chatTitle) {
          const chatId = Date.now().toString() // Generate a unique ID using timestamp
          const newChat: SavedChat = { id: chatId, name: chatTitle, messages } // Create a new SavedChat object
          setSavedChats((prev) => [...prev, newChat])
        }
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
    <div className="flex min-h-dvh w-dvw mx-auto">
      <Sidebar>
        <SidebarContent className='bg-gradient-to-bl from-gray-200 to-gray-600'>
          <SidebarHeader>
            <PageBack stayTop noFixed btnClassName="btn bg-gray-700 hover:bg-gray-600" />
          </SidebarHeader>
          <SidebarGroup>
            <SidebarGroupLabel className='text-black font-bold'>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuButton
                  type="button"
                  title="New chat"
                  className="btn card bg-gray-700 hover:bg-gray-600 rounded-xl"
                  onClick={handleNewChat}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New chat</span>
                </SidebarMenuButton>
                {savedChats?.map((item) => (
                  <SidebarMenuItem key={item?.name}>
                    <SidebarMenuButton onClick={() => loadChatFromLocalStorage(item?.id)}>
                      {item?.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="p-2">
        <SidebarTrigger className='fixed left-2 top-2 z-50' />
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
          <div ref={messagesEndRef} />
        </div>
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-700 bg-gray-800 p-4">
          <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
            <div className="flex gap-2">
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
