import { env } from '@/env';
import { Message, Thread } from '@/lib/dexie';
import { Redis } from '@upstash/redis';

/**
 * An instance of the Upstash Redis client.
 * @see https://upstash.com/docs/redis/sdks/ts
 */
export const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
  enableTelemetry: true,
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
 * Synchronizes local data with data stored in the KV (key-value) database store for a given user.
 * It compares messages and threads from the local input with those in the KV store.
 * Newer or non-existing records in the KV store are added to the local data, and vice versa.
 *
 * @param input An object containing the userId and arrays of Message and Thread objects to be synced.
 * @returns An object containing arrays of new messages and threads to be added to the local database.
 */
export async function dbSync(input: { userId: string; messages: Message[]; threads: Thread[] }) {
  // Get all messages from the KV (key-value) store
  const dbMessages = await getAllMessagesForUser(input.userId);
  const localMessages = input.messages;

  // Get all threads from the KV (key-value) store
  const dbThreads = await getAllThreadsForUser(input.userId);
  const localThreads = input.threads;

  const kvMap: Record<string, string> = {};
  const newThreads: Thread[] = [];
  const newMessages: Message[] = [];

  // Sync Messages
  for (const dbMessage of dbMessages) {
    // Check if message exists in local database
    const localMessage = localMessages.find((dbM) => dbM.id === dbMessage.id);
    // If message does not exist in local database, add it
    if (!localMessage) {
      newMessages.push(dbMessage);
    } else if (new Date(dbMessage.updated_at).getTime() > new Date(localMessage.updated_at).getTime()) {
      // If message exists in local database, update it if it is newer
      newMessages.push(dbMessage);
    }
  }
  for (const localMessage of localMessages) {
    // Check if message exists in KV store
    const key = messageSyncKey(input.userId, localMessage.id);
    const dbMessage = dbMessages.find((dbM) => dbM.id === localMessage.id);
    // If message does not exist in KV store, add it
    if (!dbMessage) {
      kvMap[key] = JSON.stringify(localMessage);
    } else if (new Date(localMessage.updated_at).getTime() > new Date(dbMessage.updated_at).getTime()) {
      // If message exists in KV store, update it if it is newer
      kvMap[key] = JSON.stringify(localMessage);
    }
  }

  // Sync Threads
  for (const dbThread of dbThreads) {
    // Check if thread exists in local database
    const localThread = localThreads.find((dbT) => dbT.id === dbThread.id);
    // If thread does not exist in local database, add it
    if (!localThread) {
      newThreads.push(dbThread);
    } else if (new Date(dbThread.updated_at).getTime() > new Date(localThread.updated_at).getTime()) {
      // If thread exists in local database, update it if it is newer
      newThreads.push(dbThread);
    }
  }
  for (const localThread of localThreads) {
    // Check if thread exists in KV store
    const key = threadSyncKey(input.userId, localThread.id);
    const dbThread = dbThreads.find((dbT) => dbT.id === localThread.id);
    // If thread does not exist in KV store, add it
    if (!dbThread) {
      kvMap[key] = JSON.stringify(localThread);
    } else if (new Date(localThread.updated_at).getTime() > new Date(dbThread.updated_at).getTime()) {
      // If thread exists in KV store, update it if it is newer
      kvMap[key] = JSON.stringify(localThread);
    }
  }

  // Execute Redis Database operations
  if (Object.keys(kvMap).length > 0) {
    // Sync new messages and threads to KV store
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
  const dbThreads = await getAllThreadsForUser(userId);
  const dbMessages = await getAllMessagesForUser(userId);

  const kvMap: Record<string, string> = {};

  dbThreads.forEach((t) => {
    const key = threadSyncKey(userId, t.id);
    kvMap[key] = JSON.stringify({
      ...t,
      updated_at: new Date().toISOString(),
      status: 'deleted',
    } as Thread);
  });
  dbMessages.forEach((m) => {
    const key = messageSyncKey(userId, m.id);
    kvMap[key] = JSON.stringify({
      ...m,
      content: '',
      updated_at: new Date().toISOString(),
      status: 'deleted',
    } as Message);
  });

  if (Object.keys(kvMap).length > 0) {
    await redis.mset(kvMap);
  }
}

export async function addAdmin(email: string) {
  const admins = ((await redis.get('admins')) as { admins: string[] })?.admins || [];
  if (!admins.includes(email)) {
    await redis.set('admins', [...admins, email]);
  }
}

export async function removeAdmin(email: string) {
  const admins = ((await redis.get('admins')) as string[]) || [];
  if (admins.includes(email)) {
    await redis.set(
      'admins',
      admins.filter((admin) => admin !== email),
    );
  }
}

export async function getAdmins() {
  return ((await redis.get('admins')) as string[]) || [];
}

export async function deleteSync() {
  const keys = await redis.keys('sync*');
  await redis.del(...keys);
}
