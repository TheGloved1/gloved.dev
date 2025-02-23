import { Message } from '@/db'
import { env } from '@/env'
import { fetchSystemPrompt } from '@/lib/actions'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createDataStreamResponse, smoothStream, streamText } from 'ai'

const genAI = createGoogleGenerativeAI({ apiKey: env.GEMINI })

const temperature = 0.95
const maxTokens = 8192

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

export async function POST(req: Request) {
  const parsed: { system?: string; messages: Omit<Message, 'id'>[] } = await req.json()
  const { messages } = parsed
  const system = parsed.system ?? (await fetchSystemPrompt())

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        system,
        model,
        messages,
        temperature,
        maxTokens,
        experimental_transform: smoothStream({
          chunking: 'word',
          delayInMs: 100,
        }),
      })
      result.mergeIntoDataStream(dataStream)
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error)
    },
  })
}
