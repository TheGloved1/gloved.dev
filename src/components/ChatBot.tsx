'use client'
import React, { useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

type Message = {
  sender: 'user' | 'model'
  text: string
}

function getApiKey() {
  if (!process.env.GEMINI) {
    throw new Error('Missing API key')
  }
  return process.env.GEMINI
}

export default function Chatbot(): React.JSX.Element {
  const apiKey = useQuery({ queryKey: ['apiKey'], queryFn: getApiKey })
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInput(event.target.value)
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  async function sendMessage(): Promise<void> {
    if (!input.trim()) return

    const userMessage: Message = { sender: 'user', text: input }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      if (!apiKey.data) {
        throw new Error('Missing API key')
      }
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.data}`,
        {
          contents: [
            ...messages.map((message) => ({
              role: message.sender,
              parts: [{ text: message.text }],
            })),
            {
              role: 'user',
              parts: [{ text: input }],
            },
          ],
          generationConfig: {
            temperature: 1,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const botMessageText = response.data?.contents?.[response.data.contents.length - 1]?.parts?.[0]?.text
      if (botMessageText) {
        const botMessage: Message = { sender: 'model', text: botMessageText }
        setMessages((prevMessages) => [...prevMessages, botMessage])
      } else {
        throw new Error('Invalid response structure')
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error)
      const errorMessage: Message = { sender: 'model', text: `${error}` }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyPress} disabled={isLoading} />
        <button onClick={sendMessage} disabled={isLoading}>
          Send
        </button>
      </div>
    </div>
  )
}
