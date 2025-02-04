'use server'
import { env } from '@/env'
import { apiRoute } from '@/lib/utils'
import { GoogleGenerativeAI } from '@google/generative-ai'
import sharp from 'sharp'

const genAI = new GoogleGenerativeAI(env.GEMINI)

export async function fetchImage(src: string) {
  const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()))
  const resizedBuffer = await sharp(buffer).blur(1).resize(10).toBuffer() // Convert to buffer
  console.log(`Fetched image buffer data for ${src}: ${resizedBuffer.toString('base64')}`)
  return resizedBuffer
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

export async function sendMessage(input: string, messages: Message[]): Promise<{ msg: Message | null; error?: string }> {
  console.log('Running sendMessage action!')
  const systemPrompt = await fetchSystemPrompt()
  if (!input.trim()) return { msg: null, error: 'Input cannot be empty' }

  const userMessage: Message = { role: Role.USER, text: input }
  const updatedMessages = [...messages, userMessage]

  try {
    const message = {
      contents: [
        ...updatedMessages.map((message) => ({
          role: message.role,
          parts: [{ text: message.text }],
        })),
        {
          role: Role.USER,
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
      return { msg: botMessage }
    } else {
      throw new Error('Invalid response structure')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    return { msg: null, error: `Error: ${error}` }
  }
}
