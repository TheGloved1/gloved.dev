import { deleteData, sync } from '@/lib/actions';
import { tryCatch } from '@/lib/utils';
import { ImagePart, TextPart } from 'ai';
import Dexie, { type EntityTable } from 'dexie';

export type Thread = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  removed: 'true' | 'false';
};

export type Message = {
  id: string;
  threadId: string;
  content: string | (TextPart | ImagePart)[] | null;
  model: string;
  role: 'user' | 'assistant';
  created_at: string;
  updated_at: string;
  finished: boolean;
  removed: 'true' | 'false';
};

class Database extends Dexie {
  threads!: EntityTable<Thread, 'id'>;
  messages!: EntityTable<Message, 'id'>;

  constructor() {
    super('chatdb');
    this.version(3).stores({
      threads: 'id, title, created_at, updated_at, last_message_at, removed',
      messages: 'id, threadId, content, model, role, [threadId+created_at], updated_at, finished, removed',
    });

    this.threads.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      obj.last_message_at = new Date().toISOString();
      obj.removed = 'false';
    });

    this.messages.hook('creating', (primKey, obj) => {
      obj.created_at = new Date().toISOString();
      obj.updated_at = new Date().toISOString();
      obj.removed = 'false';
    });
  }

  async getThreads() {
    return await this.threads.where('removed').equals('false').sortBy('last_message_at');
  }

  async getMessages() {
    return await this.messages.where('removed').equals('false').sortBy('created_at');
  }

  async addMessage(message: Omit<Message, 'id' | 'created_at' | 'updated_at' | 'removed'>) {
    const id = crypto.randomUUID();
    await this.transaction('rw', [this.messages, this.threads], async () => {
      await this.messages.add({
        ...message,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        removed: 'false',
      });
      await this.threads.update(message.threadId, {
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });
    return id;
  }

  async removeMessage(id: string) {
    await this.messages.update(id, { removed: 'true', updated_at: new Date().toISOString(), content: null });
  }

  async createThread(thread: Omit<Thread, 'id' | 'created_at' | 'updated_at' | 'last_message_at' | 'removed'>) {
    const id = crypto.randomUUID();
    await this.threads.add({
      ...thread,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      removed: 'false',
    });
    return id;
  }

  async getThreadMessages(threadId: string) {
    const messages = await this.messages.where('threadId').equals(threadId).sortBy('created_at');
    return messages.filter((m) => m.removed === 'false');
  }

  async deleteThread(threadId: string) {
    await this.threads.update(threadId, { removed: 'true', updated_at: new Date().toISOString() });
    await this.messages
      .where('threadId')
      .equals(threadId)
      .modify({ removed: 'true', content: null, updated_at: new Date().toISOString() });
  }

  async deleteAllData(userId: string | null | undefined) {
    const threads = await this.threads.toArray();
    const messages = await this.messages.toArray();
    await Promise.all(threads.map((thread) => this.threads.delete(thread.id)));
    await Promise.all(messages.map((msg) => this.messages.delete(msg.id)));
    if (userId) {
      await deleteData(userId);
    }
  }

  async syncDexie(userId: string) {
    const threads = await this.threads.toArray();
    const messages = await this.messages.toArray();
    const { data, error: dbSyncError } = await tryCatch(sync({ threads, messages }, userId));
    if (!data || dbSyncError) return console.log('[SYNC] Failed to import data');
    const { threads: newThreads, messages: newMessages } = data;
    if (!newThreads.length && !newMessages.length) return console.log('[SYNC] No data to import');
    await Promise.all([this.threads.bulkPut(newThreads), this.messages.bulkPut(newMessages)]);
    console.log('[SYNC] Imported', newThreads.length, 'threads');
    console.log('[SYNC] Imported', newMessages.length, 'messages');
  }
}

export const dxdb = new Database();

export function formatContent(content: string | (TextPart | ImagePart)[] | null): {
  content: string | null;
  image?: string;
} {
  if (typeof content === 'string' || content === null) {
    return { content };
  }
  const textParts = content.filter((part) => 'text' in part) as TextPart[];
  const imageParts = content.filter((part) => 'image' in part) as ImagePart[];
  const text = textParts.map((part) => part.text).join('');
  const image = imageParts.length ? imageParts[0].image.toString() : undefined;
  return { content: text, image };
}

export async function processStream(
  response: ReadableStream<Uint8Array>,
  messageId?: string,
  callback?: () => void,
): Promise<string> {
  if (!callback) callback = () => {};
  const reader = response.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let messageContent = '';
  let buffer = '';

  while (true) {
    if (done) break;
    const { value, done: doneReading } = await reader.read();
    done = doneReading;

    // Decode the value and process the chunk
    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk; // Accumulate the buffer

    // Split the chunk into lines based on the expected format
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (line.trim() === '') continue; // Skip empty lines

      // Handle the different types of messages in the stream
      if (line.startsWith('0:')) {
        callback();
        // This is a message chunk
        const json = JSON.parse(line.slice(2)); // Remove the prefix
        messageContent += json; // Append the new content
        if (messageId) {
          await dxdb.messages.update(messageId, {
            content: messageContent, // Update with the accumulated content
          });
        }
      } else if (line.startsWith('e:')) {
        // This indicates the end of the message
        done = true;
        if (messageId)
          await dxdb.messages.update(messageId, {
            created_at: new Date().toISOString(),
            finished: true, // Mark as finished
          });
        callback();
        break; // Exit the loop since we are done processing
      }
    }
  }

  return messageContent; // Return the accumulated message content
}

export async function createMessage(
  threadId: string,
  userContent: string,
  model: string,
  setInput: (input: string) => void,
  image?: string | null,
  callback?: () => void,
  systemPrompt?: string,
) {
  setInput('');
  let messageContent: string | (TextPart | ImagePart)[];
  if (image) {
    messageContent = [
      {
        type: 'text',
        text: userContent || '',
      },
      { type: 'image', image },
    ];
  } else {
    messageContent = userContent || '';
  }
  await dxdb.addMessage({
    threadId,
    content: messageContent,
    role: 'user',
    finished: true,
    model,
  });

  generateTitle(threadId);
  const allMessages = await dxdb.getThreadMessages(threadId);
  const contextMessages = allMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const assistantMessageId = await dxdb.addMessage({
    threadId,
    role: 'assistant',
    content: '',
    finished: false,
    model,
  });

  callback?.();

  try {
    const { data, error } = await tryCatch(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: contextMessages,
          model,
        }),
      }),
    );
    if (error) return;
    const reader = data.body as ReadableStream<Uint8Array>;
    if (!reader) return;

    // Call the helper function to process the stream
    await processStream(reader, assistantMessageId, callback);
  } catch (e) {
    console.log('Uncaught error', e);
  }

  generateTitle(threadId);

  return assistantMessageId;
}

export async function generateTitle(threadId: string) {
  const allMessages = await dxdb.getThreadMessages(threadId);
  const contextMessages = allMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const messages = [
    {
      role: 'user',
      content:
        'Messages: [' +
        contextMessages.map((m) => m.content).join('\n ') +
        ']\n Generate a short, concise title for this thread so far.',
    },
  ];
  try {
    const { data, error } = await tryCatch(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: 'You are a short title generator, do not generate any text except for the title.',
          messages: messages,
        }),
      }),
    );
    if (error) return;
    if (!data.body) return;
    const title = await processStream(data.body);
    await dxdb.threads.update(threadId, {
      updated_at: new Date().toISOString(),
      title,
    });
  } catch (e) {
    throw e;
  }
}
