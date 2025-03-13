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
 * Synchronizes local data with data stored in the KV (key-value) store for a given user.
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
  for (const m of dbMessages) {
    // Check if message exists in local database
    const localMessage = localMessages.find((dbM) => dbM.id === m.id);
    // If message does not exist in local database, add it
    if (!localMessage) {
      newMessages.push(m);
    } else if (new Date(m.updated_at) > new Date(localMessage.updated_at)) {
      // If message exists in local database, update it if it is newer
      newMessages.push(m);
    }
  }
  for (const m of localMessages) {
    // Check if message exists in KV store
    const key = messageSyncKey(input.userId, m.id);
    const dbMessage = dbMessages.find((dbM) => dbM.id === m.id);
    // If message does not exist in KV store, add it
    if (!dbMessage) {
      kvMap[key] = JSON.stringify(m);
    } else if (new Date(m.updated_at) > new Date(dbMessage.updated_at)) {
      // If message exists in KV store, update it if it is newer
      kvMap[key] = JSON.stringify(m);
    }
  }

  // Sync Threads
  for (const t of dbThreads) {
    // Check if thread exists in local database
    const localThread = localThreads.find((dbT) => dbT.id === t.id);
    // If thread does not exist in local database, add it
    if (!localThread) {
      newThreads.push(t);
    } else if (new Date(t.updated_at) > new Date(localThread.updated_at)) {
      // If thread exists in local database, update it if it is newer
      newThreads.push(t);
    }
  }
  for (const t of localThreads) {
    // Check if thread exists in KV store
    const key = threadSyncKey(input.userId, t.id);
    const dbThread = dbThreads.find((dbT) => dbT.id === t.id);
    // If thread does not exist in KV store, add it
    if (!dbThread) {
      kvMap[key] = JSON.stringify(t);
    } else if (new Date(t.updated_at) > new Date(dbThread.updated_at)) {
      // If thread exists in KV store, update it if it is newer
      kvMap[key] = JSON.stringify(t);
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
