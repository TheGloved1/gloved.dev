import { Message, Thread } from '@/dexie';
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

function messageSyncKey(userId: string, msgId: string) {
  const sanitizedMsgId = msgId.replace(/[^a-zA-Z0-9-_]/g, '');
  return `sync:msg:${userId}:${sanitizedMsgId}`;
}

function threadSyncKey(userId: string, threadId: string) {
  const sanitizedThreadId = threadId.replace(/[^a-zA-Z0-9-_]/g, '');
  return `sync:thread:${userId}:${sanitizedThreadId}`;
}

export async function getAllMessagesForUser(userId: string) {
  const keys = await redis.keys(`sync:msg:${userId}:*`);
  if (keys.length === 0) return [];
  const kvMessages = await redis.mget(keys);
  console.log('[SYNC] Messages from KV:', kvMessages);
  const messages = kvMessages.map((message) => message);
  if (messages.length === 0) return [];

  console.log('[SYNC] Fetched', messages.length, 'messages');
  console.log('[SYNC] Messages:', JSON.stringify(messages));
  return messages as Message[];
}

export async function getAllThreadsForUser(userId: string) {
  const keys = await redis.keys(`sync:thread:${userId}:*`);
  if (keys.length === 0) return [];
  const kvThreads = await redis.mget(keys);
  const threads = kvThreads.map((thread) => thread);
  if (threads.length === 0) return [];

  console.log('[SYNC] Fetched', threads.length, 'threads');
  console.log('[SYNC] Threads:', JSON.stringify(threads));
  return threads as Thread[];
}

export async function syncData(input: { userId: string; messages: Message[]; threads: Thread[] }) {
  const dbMessages = await getAllMessagesForUser(input.userId);
  console.log('[SYNC] Fetched', dbMessages.length, 'messages from KV');
  const localMessages = input.messages;

  const dbThreads = await getAllThreadsForUser(input.userId);
  console.log('[SYNC] Fetched', dbThreads.length, 'threads from KV');
  const localThreads = input.threads;

  const kvMap: Record<string, string | null> = {};
  const newThreads: Thread[] = [];
  const newMessages: Message[] = [];

  // Sync Messages
  dbMessages.forEach((m) => {
    if (!localMessages.find((dbM) => dbM.id === m.id)) {
      newMessages.push(m);
    }
  });
  localMessages.forEach((m) => {
    const key = messageSyncKey(input.userId, m.id);
    if (!dbMessages.find((dbM) => dbM.id === m.id)) {
      kvMap[key] = JSON.stringify(m);
    }
  });

  // Sync Threads
  dbThreads.forEach((t) => {
    if (!localThreads.find((dbT) => dbT.id === t.id)) {
      newThreads.push(t);
    }
  });
  localThreads.forEach((t) => {
    const key = threadSyncKey(input.userId, t.id);
    if (!dbThreads.find((dbT) => dbT.id === t.id)) {
      kvMap[key] = JSON.stringify(t);
    }
  });

  // Execute Redis operations
  if (Object.keys(kvMap).length > 0) {
    await redis.mset(kvMap);
    console.log('[SYNC] Synced', Object.keys(kvMap).length, 'messages and threads');
  }

  console.log('[SYNC] Found', newMessages.length, 'newer messages for', input.userId);
  console.log('[SYNC] Found', newThreads.length, 'newer threads for', input.userId);

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
