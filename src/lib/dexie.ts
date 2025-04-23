/**
 * A Dexie database for storing chat data. This database stores threads and messages, and provides
 * methods for adding, removing, and retrieving data. It also provides methods for synchronizing the
 * database with remote data.
 */
import { deleteUserDataAction, exportThreadAction, syncAction } from '@/lib/actions';
import { createDate, populateOnboardingThreads, sleep, tryCatch } from '@/lib/utils';
import Dexie, { type EntityTable } from 'dexie';
import { toast } from 'sonner';
import { z } from 'zod';
import { ChatFetchOptions, ModelID } from './ai';

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
  attachments: z.array(z.string()).optional(),
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
 * @property {EntityTable<Thread, 'id'>} threads - A table for storing threads.
 * @property {EntityTable<Message, 'id'>} messages - A table for storing messages.
 */
class Database extends Dexie {
  threads!: EntityTable<Thread, 'id'>;
  messages!: EntityTable<Message, 'id'>;

  constructor() {
    super('chatdb');
    this.version(4).stores({
      threads: '++id, title, created_at, last_message_at, status',
      messages:
        '++id, threadId, content, model, role, attachments, reasoning, updated_at, status, [threadId+created_at], [threadId+status]',
    });

    this.on('ready', async (obj) => {
      console.log('[DEXIE] Ready');
    });

    this.on('populate', async () => {
      const populate = await tryCatch(populateOnboardingThreads(this));
      if (populate.error) {
        console.log('[DEXIE] Failed to populate onboarding threads');
      }
    });

    this.threads.hook('creating', (primKey, obj) => {
      // console.log('[DEXIE] Creating thread', obj);
    });

    this.messages.hook('creating', (primKey, obj) => {
      // console.log('[DEXIE] Creating message', obj);
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
  async addMessage(message: Omit<Message, 'id' | 'updated_at' | 'created_at'>) {
    const id = crypto.randomUUID();
    await this.transaction('rw', [this.messages, this.threads], async () => {
      await this.messages.add({
        ...message,
        id,
        updated_at: createDate(),
        created_at: createDate(),
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
    await this.messages.update(id, {
      status: 'deleted',
      updated_at: createDate(),
      content: '',
      attachments: undefined,
      reasoning: undefined,
    });
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
   * Exports a thread to the server. This function is idempotent; if the export fails, it will not
   * modify the local database.
   * @param threadId The ID of the thread to export.
   * @param userId The user ID to associate with the exported thread.
   */
  async exportThread(threadId: string, userId: string) {
    const thread = await this.threads.get(threadId);
    if (!thread) return;
    const messages = await this.messages.where('threadId').equals(threadId).toArray();
    const { error: exportError } = await tryCatch(exportThreadAction(userId, { thread, messages }));
    if (exportError) {
      console.log('[SYNC] Failed to export thread to server');
    } else {
      console.log('[SYNC] Successfully exported thread to server');
    }
  }

  /**
   * Fetches all messages for a given thread, sorted by creation date.
   * @param threadId The ID of the thread to fetch messages for.
   * @returns An array of all messages in the thread, excluding deleted messages.
   */
  async getThreadMessages(threadId: string) {
    return await this.messages
      .where('threadId')
      .equals(threadId)
      .and((msg) => msg.status !== 'deleted')
      .sortBy('created_at');
  }

  /**
   * Marks a thread as removed and all its messages as removed.
   * @param threadId The ID of the thread to delete.
   */
  async deleteThread(threadId: string, userId?: string) {
    // Mark thread as deleted
    await this.threads.update(threadId, { status: 'deleted', updated_at: createDate() });

    // Mark messages as deleted
    await this.messages
      .where('threadId')
      .equals(threadId)
      .modify({ status: 'deleted', content: '', updated_at: createDate(), attachments: undefined, reasoning: undefined });

    if (userId) {
      await this.exportThread(threadId, userId);
    }
  }

  /**
   * Deletes all data from the database and clears the remote data.
   * @param userId The user ID to clear remote data for. If `null` or `undefined`, it will not clear remote data.
   */
  async deleteAllData(userId?: string | null) {
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
    await sleep(500);
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
  }

  /**
   * Exports all threads and messages from the database to a JSON file.
   * The file is automatically downloaded to the user's device with a timestamped filename.
   */
  async export() {
    const threads = await this.getThreads();
    const messages = await this.getMessages();
    const jsonString = JSON.stringify({ threads, messages }, null, 2);
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
async function checkDb() {
  if (typeof window === 'undefined') return;
  if (dxdb.hasFailed()) {
    console.log('[DEXIE] Database failed, deleting all data...');
    return await dxdb.deleteAllData();
  }
}
checkDb();
export type dxdbType = typeof dxdb;

/**
 * Checks if it has been more than 30 seconds since the last sync, and if so,
 * calls `dxdb.syncDexie` to synchronize the database with the remote data.
 * The last sync time is stored in local storage to prevent excessive reads and writes to the database.
 * @param userId The user ID to sync data with.
 */
export async function checkSync(userId: string) {
  if (typeof window === 'undefined') return;
  const lastSync = localStorage.getItem('lastSync');
  const now = new Date().getTime();

  // If lastRun is null or more than 5 minutes (300000 milliseconds) has passed
  if (!lastSync || now - Number(lastSync) > 300000) {
    // Your function logic here
    await dxdb.syncDexie(userId);

    // Update the last run time in local storage
    localStorage.setItem('lastSync', now.toString());
  }
}

/**
 * Process a stream of data from the chat server, updating the local database as new content is received.
 * @param response The stream of data to process.
 * @param messageId The ID of the message to update in the database, if applicable.
 * @param callback A function to call when the response has been processed. Default is an empty function.
 * @returns A Promise that resolves with the accumulated message content.
 */
export async function processStream(
  response: ReadableStream<Uint8Array>,
  messageId?: string,
  userId?: string,
): Promise<string> {
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
        // This is a message chunk
        const json: string = JSON.parse(line.slice(2)); // Remove the prefix
        messageContent += json; // Append the new content
        if (messageId) {
          await dxdb.messages.update(messageId, {
            updated_at: createDate(),
            content: messageContent, // Update with the accumulated content
          });
        }
      } else if (line.startsWith('g:')) {
        // This is a reasoning chunk
        const json: string = JSON.parse(line.slice(2)); // Remove the prefix
        reasoning += json.replace(/<think>|<\/think>/g, '');
        if (messageId && reasoning.trim() !== '') {
          await dxdb.messages.update(messageId, {
            updated_at: createDate(),
            reasoning: reasoning, // Update with the accumulated reasoning
          });
        }
      } else if (line.startsWith('3:')) {
        // This is an error chunk
        const json: string = JSON.parse(line.slice(2)); // Remove the prefix
        if (messageId) {
          await dxdb.messages.update(messageId, {
            updated_at: createDate(),
            content: json,
            status: 'error',
          });
        }
      } else if (line.startsWith('e:')) {
        // This indicates the end of the message
        done = true;
        if (messageId) {
          await dxdb.messages.update(messageId, {
            created_at: createDate(),
            updated_at: createDate(),
            status: 'done', // Mark as finished
          });
          if (userId) {
          }
        }
        break; // Exit the loop since we are done processing
      }
    }
  }
  if (messageId && messageContent.trim() === '') {
    await dxdb.messages.update(messageId, {
      updated_at: createDate(),
      status: 'error',
    });
  }

  if (messageContent.trim() === '') return 'Error: No content received';

  return messageContent; // Return the accumulated message content
}

let chatAbortController = new AbortController();
/**
 * Stop any existing streams and cancel any ongoing chat generation.
 * @param reason An optional reason to pass to the AbortController.
 */
export function stopGeneration(reason?: string) {
  chatAbortController.abort(reason || 'Cancelling any existing streams...');
  chatAbortController = new AbortController();
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
 * @param attachments An optional array of attachments to send with the message.
 * @param userId The ID of the user to use for syncing to db.
 * @returns The ID of the message that was sent.
 */
export async function createMessage(
  threadId: string,
  userContent: string,
  model: ModelID,
  systemPrompt?: string,
  attachments?: string[],
  userId?: string,
) {
  // Stop any existing streams
  stopGeneration('Creating message, canceling any existing streams');

  await dxdb.addMessage({
    threadId,
    content: userContent,
    role: 'user',
    model,
    status: 'done',
    attachments,
  });
  generateTitle(threadId);
  const allMessages = await dxdb.getThreadMessages(threadId);
  const assistantMessageId = await dxdb.addMessage({
    threadId,
    role: 'assistant',
    content: '',
    status: 'streaming',
    model,
  });

  const chatFetchOptions: ChatFetchOptions = {
    model,
    system: systemPrompt,
    messages: allMessages,
  };

  const signal = chatAbortController.signal;

  try {
    const { data, error } = await tryCatch(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatFetchOptions),
        signal,
      }),
    );
    if (error) return;
    const reader = data.body as ReadableStream<Uint8Array>;
    if (!reader) return;

    // Call the helper function to process the stream
    await dxdb.messages.update(assistantMessageId, { status: 'streaming' });
    await processStream(reader, assistantMessageId);
    await dxdb.messages.update(assistantMessageId, { status: 'done' });
  } catch (e) {
    console.log('Uncaught error', e);
  }

  await generateTitle(threadId);
  if (userId) {
    await dxdb.exportThread(threadId, userId);
  }

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
  model: ModelID,
  systemPrompt?: string,
  userId?: string,
) {
  // Stop any existing streams
  stopGeneration('Updating message, canceling any existing streams');

  const messageContent: string = newContent;
  await dxdb.messages.update(message.id, { content: messageContent, updated_at: createDate(), model: model });
  generateTitle(message.threadId);
  const allMessages = await dxdb.getThreadMessages(message.threadId);
  const assistantMessageId = await dxdb.addMessage({
    threadId: message.threadId,
    role: 'assistant',
    content: '',
    status: 'streaming',
    model,
  });

  const signal = chatAbortController.signal;

  try {
    const { data, error } = await tryCatch(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system: systemPrompt,
          messages: allMessages,
          model,
        }),
        signal,
      }),
    );
    if (error) return;
    const reader = data.body as ReadableStream<Uint8Array>;
    if (!reader) return;

    await processStream(reader, assistantMessageId);
  } catch (e) {
    console.log('Uncaught error', e);
    toast.error('Uh Oh! Something went wrong.');
  }

  await generateTitle(message.threadId);

  if (userId) {
    dxdb.exportThread(message.threadId, userId);
  }

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
  const newMessage = {
    role: 'user',
    content: 'Generate a short, concise title for this thread so far.',
  };
  const messages: { role: string; content: string }[] = [
    ...allMessages.map((m) => ({ role: m.role, content: m.content })),
    newMessage,
  ];
  const model: ModelID = 'gemini-2.0-flash';
  try {
    const { data, error } = await tryCatch(
      fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system:
            'You are a short title generator, do not generate any text except for the title. Only include alphanumeric characters and spaces. You can not output any markdown formatting or special characters. You can only output characters from the english alphabet. For example, "Hello World" is a valid title, but "**Hello World!**" is not.',
          messages: messages,
          model: model,
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
