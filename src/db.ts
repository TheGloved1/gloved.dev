import { Role } from '@/lib/types'
import Dexie, { type EntityTable } from 'dexie'

export interface Thread {
  id: string
  title: string
  created_at: Date
  updated_at: Date
  last_message_at: Date
  removed: 'true' | 'false'
}

export interface Message {
  id: string
  threadId: string
  content: string
  role: 'user' | 'assistant'
  created_at: Date
  finished: boolean
  removed: 'true' | 'false'
}

class Database extends Dexie {
  threads!: EntityTable<Thread, 'id'>
  messages!: EntityTable<Message, 'id'>

  constructor() {
    super('Database')
    this.version(1).stores({
      threads: 'id, title, created_at, updated_at, last_message_at, removed',
      messages: 'id, threadId, content, role, [threadId+created_at], finished, removed',
    })

    this.threads.hook('creating', (primKey, obj) => {
      obj.created_at = new Date()
      obj.updated_at = new Date()
      obj.last_message_at = new Date()
      obj.removed = 'false'
    })

    this.messages.hook('creating', (primKey, obj) => {
      obj.created_at = new Date()
    })
  }

  async getThreads() {
    return await this.threads.where('removed').equals('false').sortBy('last_message_at')
  }

  async addMessage(message: Omit<Message, 'id' | 'created_at' | 'removed'>) {
    const id = crypto.randomUUID()
    await this.transaction('rw', [this.messages, this.threads], async () => {
      await this.messages.add({ ...message, id, created_at: new Date(), removed: 'false' })
      await this.threads.update(message.threadId, {
        last_message_at: new Date(),
        updated_at: new Date(),
      })
    })
    return id
  }

  async removeMessage(id: string) {
    await this.messages.update(id, { removed: 'true' })
  }

  async createThread(
    thread: Omit<Thread, 'id' | 'created_at' | 'updated_at' | 'last_message_at' | 'removed'>,
  ) {
    const id = crypto.randomUUID()
    await this.threads.add({
      ...thread,
      id,
      created_at: new Date(),
      updated_at: new Date(),
      last_message_at: new Date(),
      removed: 'false',
    })
    return id
  }

  async getThreadMessages(threadId: string) {
    const messages = await this.messages.where('threadId').equals(threadId).sortBy('created_at')
    return messages.filter((m) => m.removed === 'false')
  }

  async deleteThread(threadId: string) {
    await this.threads.update(threadId, { removed: 'true' })
  }
}

export const db = new Database()

export async function processStream(
  response: ReadableStream<Uint8Array>,
  messageId?: string,
  callback?: () => void,
): Promise<string> {
  if (!callback) callback = () => {}
  const reader = response.getReader()
  const decoder = new TextDecoder()
  let done = false
  let messageContent = ''

  while (true) {
    if (done) break
    const { value, done: doneReading } = await reader.read()
    done = doneReading

    // Decode the value and process the chunk
    const chunk = decoder.decode(value, { stream: true })

    // Split the chunk into lines based on the expected format
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (line.trim() === '') continue // Skip empty lines

      // Handle the different types of messages in the stream
      if (line.startsWith('0:')) {
        callback()
        // This is a message chunk
        const json = JSON.parse(line.slice(2)) // Remove the prefix
        messageContent += json // Append the new content
        if (messageId)
          await db.messages.update(messageId, {
            content: messageContent, // Update with the accumulated content
          })
      } else if (line.startsWith('e:')) {
        // This indicates the end of the message
        done = true
        if (messageId)
          await db.messages.update(messageId, {
            finished: true, // Mark as finished
          })
        callback()
        break // Exit the loop since we are done processing
      }
    }
  }

  return messageContent // Return the accumulated message content
}

export async function createMessage(
  threadId: string,
  userContent: string,
  setInput: (input: string) => void,
  callback?: () => void,
) {
  setInput('')
  await db.addMessage({ threadId, content: userContent, role: Role.USER, finished: true })
  generateTitle(threadId)
  const allMessages = await db.getThreadMessages(threadId)
  const contextMessages = allMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }))
  const assistantMessageId = await db.addMessage({
    threadId,
    role: Role.MODEL,
    content: '',
    finished: false,
  })
  callback?.()

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: contextMessages,
      }),
    })

    const reader = response.body
    if (!reader) return

    // Call the helper function to process the stream
    await processStream(reader, assistantMessageId, callback)
  } catch (e) {
    console.log('Uncaught error', e)
  }

  generateTitle(threadId)

  return assistantMessageId
}

export async function generateTitle(threadId: string) {
  const allMessages = await db.getThreadMessages(threadId)
  const contextMessages = allMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }))
  const messages = [
    {
      role: Role.USER,
      content:
        'Messages: [' +
        contextMessages.map((m) => m.content).join('\n ') +
        ']\n Generate a short, concise title for this thread so far.',
    },
  ]
  console.log(messages)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system: 'You are a short title generator, do not generate any text except for the title.',
        messages: messages,
      }),
    })
    if (!response.body) return
    const title = await processStream(response.body)
    await db.threads.update(threadId, {
      updated_at: new Date(),
      title,
    })
  } catch (e) {
    throw e
  }
}
