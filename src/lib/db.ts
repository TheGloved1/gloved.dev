import { Message, Thread } from '@/dexie';
import { Redis } from '@upstash/redis';

/**
 * An instance of the Upstash Redis client, used for storing and retrieving
 * Message and Thread objects in the key-value store.
 * @see https://upstash.com/docs/redis/sdks/ts
 */
export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  enableTelemetry: true,
  enableAutoPipelining: true,
});

/**
 * Generates a key for storing a Message object in the key-value store.
 * The key format is "sync:msg:<userId>:<sanitizedMessageId>".
 * @param userId The user ID that owns the message.
 * @param messageId The ID of the message.
 * @returns A string key for storing the message in the key-value store.
 */
function messageSyncKey(userId: string, messageId: string) {
  const sanitizedMessageId = messageId.replace(/[^a-zA-Z0-9-_]/g, '');
  return `sync:msg:${userId}:${sanitizedMessageId}`;
}

/**
 * Generates a key for storing a Thread object in the key-value store.
 * The key format is "sync:thread:<userId>:<sanitizedThreadId>".
 * @param userId The user ID that owns the thread.
 * @param threadId The ID of the thread.
 * @returns A string key for storing the thread in the key-value store.
 */
function threadSyncKey(userId: string, threadId: string) {
  const sanitizedThreadId = threadId.replace(/[^a-zA-Z0-9-_]/g, '');
  return `sync:thread:${userId}:${sanitizedThreadId}`;
}

/**
 * Retrieves all messages stored in the key-value store for a given user.
 * @param userId The user ID to fetch messages for.
 * @returns An array of Message objects stored in the key-value store.
 */
export async function getAllMessagesForUser(userId: string) {
  const keys = await redis.keys(`sync:msg:${userId}:*`);
  if (keys.length === 0) return [];
  const kvMessages = await redis.mget(keys);
  console.log('[SYNC] Messages from KV:', kvMessages);
  const messages = kvMessages.map((message) => message);
  if (messages.length === 0) return [];

  console.log('[SYNC] Fetched', messages.length, 'messages from KV');
  return messages as Message[];
}

/**
 * Retrieves all threads stored in the key-value store for a given user.
 * @param userId The user ID to fetch threads for.
 * @returns An array of Thread objects stored in the key-value store.
 */
export async function getAllThreadsForUser(userId: string) {
  const keys = await redis.keys(`sync:thread:${userId}:*`);
  if (keys.length === 0) return [];
  const kvThreads = await redis.mget(keys);
  const threads = kvThreads.map((thread) => thread);
  if (threads.length === 0) return [];

  console.log('[SYNC] Fetched', threads.length, 'threads from KV');
  return threads as Thread[];
}

/**
 * Synchronizes local data with data stored in the key-value store for a given user.
 * It compares messages and threads from the local input with those in the key-value store.
 * Newer or non-existing records in the key-value store are added to the local data, and vice versa.
 *
 * @param input An object containing the userId and arrays of Message and Thread objects to be synced.
 * @returns An object containing arrays of new messages and threads to be added to the local database.
 */
export async function syncData(input: { userId: string; messages: Message[]; threads: Thread[] }) {
  const dbMessages = await getAllMessagesForUser(input.userId);
  const localMessages = input.messages;

  const dbThreads = await getAllThreadsForUser(input.userId);
  const localThreads = input.threads;

  const kvMap: Record<string, string | null> = {};
  const newThreads: Thread[] = [];
  const newMessages: Message[] = [];

  // Sync Messages
  dbMessages.forEach((m) => {
    const localMessage = localMessages.find((dbM) => dbM.id === m.id);
    if (!localMessage) {
      newMessages.push(m);
    } else if (new Date(m.updated_at) > new Date(localMessage.updated_at)) {
      newMessages.push(m);
    }
  });
  localMessages.forEach((m) => {
    const key = messageSyncKey(input.userId, m.id);
    const dbMessage = dbMessages.find((dbM) => dbM.id === m.id);
    if (!dbMessage) {
      kvMap[key] = JSON.stringify(m);
    } else if (new Date(m.updated_at) > new Date(dbMessage.updated_at)) {
      kvMap[key] = JSON.stringify(m);
    }
  });

  // Sync Threads
  dbThreads.forEach((t) => {
    const localThread = localThreads.find((dbT) => dbT.id === t.id);
    if (!localThread) {
      newThreads.push(t);
    } else if (new Date(t.updated_at) > new Date(localThread.updated_at)) {
      newThreads.push(t);
    }
  });
  localThreads.forEach((t) => {
    const key = threadSyncKey(input.userId, t.id);
    const dbThread = dbThreads.find((dbT) => dbT.id === t.id);
    if (!dbThread) {
      kvMap[key] = JSON.stringify(t);
    } else if (new Date(t.updated_at) > new Date(dbThread.updated_at)) {
      kvMap[key] = JSON.stringify(t);
    }
  });

  // Execute Redis operations
  if (Object.keys(kvMap).length > 0) {
    // Sync new messages and threads to KV
    console.log('[SYNC] Syncing', Object.keys(kvMap).length, 'keys to KV');
    await redis.mset(kvMap);
  }

  console.log('[SYNC] Found', newMessages.length, 'newer messages for', input.userId);
  console.log('[SYNC] Found', newThreads.length, 'newer threads for', input.userId);

  // Return new messages and threads to be added to the local database
  return {
    messages: newMessages,
    threads: newThreads,
  };
}

export async function deleteUserData(userId: string) {
  const threadKeys = await redis.keys(`sync:thread:${userId}:*`);
  const messagesKeys = await redis.keys(`sync:msg:${userId}:*`);
  const allKeys = threadKeys.concat(messagesKeys);
  const keys = await redis.del(...allKeys);
  console.log('[SYNC] Deleted', keys, 'keys for', userId);
}
