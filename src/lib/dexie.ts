import { deleteUserDataAction, syncAction } from '@/lib/actions';
import { populateOnboardingThreads, tryCatch } from '@/lib/utils';
import Dexie, { type EntityTable } from 'dexie';
import { toast } from 'sonner';
import { z } from 'zod';

export const createDate = () => new Date().toISOString();

export const threadSchema = z.object({
  id: z.string(),
  title: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  last_message_at: z.string(),
  status: z.enum(['streaming', 'done', 'error', 'deleted']),
});

export const messageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  content: z.string(),
  reasoning: z.string().optional(),
  model: z.string(),
  role: z.enum(['user', 'assistant']),
  created_at: z.string(),
  updated_at: z.string(),
  status: z.enum(['streaming', 'done', 'error', 'deleted']),
});

export type Thread = z.infer<typeof threadSchema>;
export type Message = z.infer<typeof messageSchema>;

/**
 * A Dexie database for storing chat data. This database stores threads and messages, and provides
 * methods for adding, removing, and retrieving data. It also provides methods for synchronizing the
 * database with remote data.
 * @class
 * @extends Dexie
 * @memberof module:dexie
 * @property {EntityTable<Thread, 'id'>} threads - A table for storing threads.
 * @property {EntityTable<Message, 'id'>} messages - A table for storing messages.
 */
class Database extends Dexie {
  threads!: EntityTable<Thread, 'id'>;
  messages!: EntityTable<Message, 'id'>;

  constructor() {
    super('chatdb');
    this.version(2).stores({
      threads: '++id, title, created_at, updated_at, last_message_at, status',
      messages: '++id, threadId, content, model, role, [threadId+created_at], updated_at, status',
    });

    this.on('populate', async () => {
      await populateOnboardingThreads(this);
    });

    this.threads.hook('creating', (primKey, obj) => {
      obj.created_at = createDate();
      obj.updated_at = createDate();
      obj.last_message_at = createDate();
    });

    this.messages.hook('creating', (primKey, obj) => {
      obj.created_at = createDate();
      obj.updated_at = createDate();
    });
  }

  /**
   * Retrieves all threads that have not been removed, sorted by their last message date.
   * @returns A promise that resolves to an array of threads.
   */
  async getThreads() {
    return (await this.threads.where('status').notEqual('deleted').sortBy('last_message_at')).toReversed();
  }

  async getThread(threadId: string) {
    return (await this.getThreads()).find((t) => t.id === threadId);
  }

  /**
   * Retrieves all messages that have not been removed, sorted by their creation date.
   * @returns A promise that resolves to an array of messages.
   */
  async getMessages() {
    return await this.messages.where('status').notEqual('deleted').sortBy('created_at');
  }

  /**
   * Adds a new message to the database, updating the last message time for the
   * associated thread.
   * @param message A partial `Message` object without the `id`, `created_at`, `updated_at`, and `removed` fields.
   * @returns The ID of the created message.
   */
  async addMessage(message: Omit<Message, 'id' | 'updated_at'>) {
    const id = crypto.randomUUID();
    await this.transaction('rw', [this.messages, this.threads], async () => {
      await this.messages.add({
        ...message,
        id,
        updated_at: createDate(),
      });
      await this.threads.update(message.threadId, {
        last_message_at: createDate(),
        updated_at: createDate(),
      });
    });
    return id;
  }

  /**
   * Marks a message as deleted by updating its status and clearing its content.
   * @param id The ID of the message to remove.
   */
  async removeMessage(id: string) {
    await this.messages.update(id, { status: 'deleted', updated_at: createDate(), content: '' });
  }

  /**
   * Creates a new thread and adds it to the database.
   * @returns The ID of the created thread.
   */
  async createThread() {
    const id = crypto.randomUUID();
    await this.threads.add({
      id,
      title: 'New Chat',
      created_at: createDate(),
      updated_at: createDate(),
      last_message_at: createDate(),
      status: 'done',
    });
    return id;
  }

  /**
   * Fetches all messages for a given thread, sorted by creation date.
   * @param threadId The ID of the thread to fetch messages for.
   * @returns An array of all messages in the thread, excluding deleted messages.
   */
  async getThreadMessages(threadId: string) {
    return (await this.messages.where('threadId').equals(threadId).sortBy('created_at')).filter(
      (m) => m.status !== 'deleted',
    );
  }

  /**
   * Marks a thread as removed and all its messages as removed.
   * @param threadId The ID of the thread to delete.
   */
  async deleteThread(threadId: string) {
    await this.threads.update(threadId, { status: 'deleted', updated_at: createDate() });
    await this.messages
      .where('threadId')
      .equals(threadId)
      .modify({ status: 'deleted', content: '', updated_at: createDate() });
  }

  /**
   * Deletes all data from the database and clears the remote data.
   * @param userId The user ID to clear remote data for. If `null` or `undefined`, it will not clear remote data.
   */
  async deleteAllData(userId: string | null | undefined) {
    const threads = await this.threads.toArray();
    const messages = await this.messages.toArray();
    await Promise.all(threads.map((thread) => this.threads.delete(thread.id)));
    await Promise.all(messages.map((msg) => this.messages.delete(msg.id)));
    if (userId) {
      const { error: deleteUserDataError } = await tryCatch(deleteUserDataAction(userId));
      if (deleteUserDataError) {
        console.log('[SYNC] Failed to delete user data for', userId);
      } else {
        console.log('[SYNC] Deleted user data for', userId);
      }
    }
    await populateOnboardingThreads(this);
  }

  /**
   * Synchronizes the database with the remote data. This function is idempotent. If the remote data
   * is not available, it will return without doing anything.
   * @param userId The user ID to sync data with.
   */
  async syncDexie(userId: string) {
    const startTime = performance.now();
    const threads = await this.threads.toArray();
    const messages = await this.messages.toArray();
    const { data, error: dbSyncError } = await tryCatch(syncAction({ threads, messages }, userId));
    if (!data || dbSyncError) return console.log('[SYNC] Failed to import data'), toast.error('Failed to import data');
    const { threads: newThreads, messages: newMessages } = data;
    if (!newThreads.length && !newMessages.length) return console.log('[SYNC] No data found in server');
    await Promise.all([this.threads.bulkPut(newThreads), this.messages.bulkPut(newMessages)]);
    const endTime = performance.now();
    console.log(`[SYNC] Import took ${(endTime - startTime).toFixed(2)}ms`);
    toast.success(`Imported data in ${(endTime - startTime).toFixed(2)}ms`);
  }

  /**
   * Exports all threads and messages from the database to a JSON file.
   * The file is automatically downloaded to the user's device with a timestamped filename.
   */
  async export() {
    const threads = await this.getThreads();
    const messages = await this.getMessages();
    const jsonString = JSON.stringify({ threads, messages });
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chatdb-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports all threads and messages from a JSON file.
   * @param json A JSON string containing the threads and messages to import.
   */
  async import(json: string) {
    const result = JSON.parse(json);
    if (!result.messages || !result.threads) {
      toast.error('[IMPORT] Invalid JSON');
      return;
    }
    const { threads, messages } = result as { threads: Thread[]; messages: Message[] };
    await this.threads.bulkPut(threads);
    await this.messages.bulkPut(messages);
  }
}

export const dxdb = new Database();
export type dxdbType = typeof dxdb;

/**
 * Checks if it has been more than 30 seconds since the last sync, and if so,
 * calls `dxdb.syncDexie` to synchronize the database with the remote data.
 * The last sync time is stored in local storage to prevent excessive reads and writes to the database.
 * @param userId The user ID to sync data with.
 */
export async function checkSync(userId: string) {
  const lastSync = localStorage.getItem('lastSync');
  const now = new Date().getTime();

  // If lastRun is null or more than 30 seconds (30000 milliseconds) has passed
  if (!lastSync || now - Number(lastSync) > 30000) {
    // Your function logic here
    await dxdb.syncDexie(userId);

    // Update the last run time in local storage
    localStorage.setItem('lastSync', now.toString());
  } else {
    console.log('[SYNC] Function has run recently. Skipping...');
  }
}

/**
 * Process a readable stream of message chunks and update the message content.
 * @param response The readable stream of message chunks.
 * @param messageId The ID of the message to update with the new content.
 * @param callback A function to call each time a message chunk is processed.
 * @returns A promise that resolves with the accumulated message content.
 */
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
  let reasoning = '';

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
            updated_at: createDate(),
            content: messageContent, // Update with the accumulated content
          });
        }
      } else if (line.startsWith('g:')) {
        callback();
        // This is a reasoning chunk
        const json = JSON.parse(line.slice(2)); // Remove the prefix
        reasoning += json; // Append the new content
        if (messageId) {
          await dxdb.messages.update(messageId, {
            updated_at: createDate(),
            reasoning: reasoning, // Update with the accumulated reasoning
          });
        }
      } else if (line.startsWith('e:')) {
        // This indicates the end of the message
        done = true;
        if (messageId)
          await dxdb.messages.update(messageId, {
            created_at: createDate(),
            updated_at: createDate(),
            status: 'done', // Mark as finished
          });
        callback();
        break; // Exit the loop since we are done processing
      }
    }
  }

  return messageContent; // Return the accumulated message content
}

/**
 * Sends a message to the chat server and updates the UI with the response.
 * @param threadId The ID of the thread to send the message to.
 * @param userContent The content of the message from the user.
 * @param model The model to use for generating the response.
 * @param setInput A function to call when the user's input has been processed.
 * @param image An optional image to send with the message.
 * @param callback A function to call when the response has been processed.
 * @param systemPrompt An optional system prompt to send with the message.
 * @returns The ID of the message that was sent.
 */
export async function createMessage(
  threadId: string,
  userContent: string,
  model: string,
  setInput: (input: string) => void,
  callback?: () => void,
  systemPrompt?: string,
) {
  setInput('');
  await dxdb.addMessage({
    threadId,
    content: userContent,
    role: 'user',
    model,
    status: 'done',
    created_at: createDate(),
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
    status: 'streaming',
    model,
    created_at: createDate(),
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
    await dxdb.threads.update(assistantMessageId, { status: 'streaming' });
    await processStream(reader, assistantMessageId, callback);
    await dxdb.threads.update(assistantMessageId, { status: 'done' });
  } catch (e) {
    console.log('Uncaught error', e);
  }

  generateTitle(threadId);

  return assistantMessageId;
}

/**
 * Updates an existing message and generates a new assistant response.
 * @param message The message to update.
 * @param newContent The new content for the user's message.
 * @param model The model to use for generating the response.
 * @param callback A function to call when the response has been processed.
 * @param systemPrompt An optional system prompt to send with the message.
 * @returns The ID of the new assistant message.
 */
export async function updateMessage(
  message: Message,
  newContent: string,
  model: string,
  callback: () => void,
  systemPrompt?: string,
) {
  callback();
  const messageContent: string = newContent || '';
  await dxdb.messages.update(message.id, { content: messageContent, updated_at: createDate(), model: model });

  generateTitle(message.threadId);
  const allMessages = await dxdb.getThreadMessages(message.threadId);
  const contextMessages = allMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const assistantMessageId = await dxdb.addMessage({
    threadId: message.threadId,
    role: 'assistant',
    content: '',
    status: 'streaming',
    model,
    created_at: createDate(),
  });

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
    await dxdb.threads.update(assistantMessageId, { status: 'streaming' });
    await processStream(reader, assistantMessageId, callback);
    await dxdb.threads.update(assistantMessageId, { status: 'done' });
  } catch (e) {
    console.log('Uncaught error', e);
    toast.error('Uh Oh! Something went wrong.');
  }

  generateTitle(message.threadId);

  return assistantMessageId;
}

/**
 * Generates a short, concise title for a thread by sending the current
 * conversation to the chat API. The title is then updated in the database.
 *
 * @param threadId The thread ID to generate a title for
 * @returns A promise that resolves when the title is updated
 */
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
    if (error) return toast.error('Failed to generate title');
    if (!data.body) return toast.error('Failed to generate title');
    const title = await processStream(data.body);
    await dxdb.threads.update(threadId, {
      updated_at: createDate(),
      title,
    });
  } catch (e) {
    console.log('Uncaught error', e);
    toast.error('Failed to generate title');
  }
}
