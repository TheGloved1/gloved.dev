'use server'
import { env } from '@/env'
import { apiRoute } from '@/lib/utils'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { Message, streamText } from 'ai'
import sharp from 'sharp'

export async function fetchImage(src: string) {
  const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()))
  const resizedBuffer = await sharp(buffer).blur(1).resize(10).toBuffer() // Convert to buffer
  console.log(`Fetched image buffer data for ${src}: ${resizedBuffer.toString('base64')}`)
  return resizedBuffer
}

export async function fetchSystemPrompt() {
  const response = await fetch(apiRoute('/system-prompt'))
  const data: string = await response.text()
  if (!data) {
    return ''
  }
  return data
}

export async function checkDevMode(): Promise<boolean> {
  const environment = env.NODE_ENV

  if (environment === 'development') {
    return true
  }
  return false
}

const genAI = createGoogleGenerativeAI({ apiKey: env.GEMINI })

const model = genAI.languageModel('gemini-1.5-flash', {
  safetySettings: [
    {
      category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_NONE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_NONE',
    },
  ],
})

export async function fetchAiStream(messages: Omit<Message, 'id'>[], threadId: string) {
  const system = await fetchSystemPrompt()

  console.log('Thread ID???!', threadId)

  return streamText({
    system,
    model: model,
    messages,
  })
}
