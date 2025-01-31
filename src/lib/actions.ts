'use server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'
import sharp from 'sharp'
import { env } from './env'
import { apiRoute } from '@/lib/utils'

const getGenAI = () => {
  if (!process.env.GEMINI) {
    return null
  }
  return new GoogleGenerativeAI(process.env.GEMINI)
}

export async function fetchImage(src: string) {
  const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()))
  const resizedBuffer = await sharp(buffer).blur(1).resize(10).toBuffer() // Convert to buffer
  console.log(`Fetched image buffer data for ${src}: ${resizedBuffer.toString('base64')}`)
  return resizedBuffer
}

export async function getEnv() {
  return env
}

async function fetchSystemPrompt() {
  const response = await fetch(apiRoute('/system-prompt'))
  const data: string = await response.text()
  if (!data) {
    return ''
  }
  return data
}

enum Role {
  USER = 'user',
  MODEL = 'model',
}
type Message = {
  role: Role
  text: string
}

export async function sendMessage(input: string, messages: Message[]): Promise<{ message: Message | null; error?: string }> {
  const genAI = getGenAI()
  const systemPrompt = await fetchSystemPrompt()
  if (!input.trim()) return { message: null, error: 'Input cannot be empty' }

  const userMessage: Message = { role: Role.USER, text: input }
  const updatedMessages = [...messages, userMessage]

  try {
    if (!genAI) {
      throw new Error('Missing API key')
    }
    const message = {
      contents: [
        ...updatedMessages.map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
        {
          role: 'user',
          parts: [{ text: input }],
        },
      ],
    }
    const generationConfig = {
      temperature: 1,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    }
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: generationConfig,
      systemInstruction: systemPrompt,
    })
    const result = await model.generateContent(message)

    const botMessageText = result.response.text().trim()
    if (botMessageText) {
      const botMessage: Message = { role: Role.MODEL, text: botMessageText }
      return { message: botMessage }
    } else {
      throw new Error('Invalid response structure')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return { message: null, error: `${error}` }
  }
}
