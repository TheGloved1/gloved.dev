'use client'
import { sendMessage } from '@/lib/actions'
import React, { useState } from 'react'

enum Role {
  USER = 'user',
  MODEL = 'model',
}

type Message = {
  sender: Role
  text: string
}

export default function Chatbot(): React.JSX.Element | null {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInput(event.target.value)
  }

  async function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      await handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    setIsLoading(true)
    setMessages((msgs) => [...msgs, { sender: Role.USER, text: input }])
    setMessages((msgs) => [...msgs, { sender: Role.MODEL, text: 'Loading...' }])
    const { message: updatedMessage, error } = await sendMessage(input, messages)

    if (error || !updatedMessage) {
      alert(error)
      setMessages((msgs) => msgs.slice(0, -2))
    } else {
      setMessages((msgs) => msgs.slice(0, -1))
      setMessages((msgs) => [...msgs, updatedMessage])
    }

    setInput('') // Clear input after sending
    setIsLoading(false)
  }

  return (
    <div className="chatbot-container align-bottom">
      <div className="chatHistory chat-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === Role.USER ? 'bot' : 'user'}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyPress} disabled={isLoading} />
        <button onClick={handleSendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  )
}
