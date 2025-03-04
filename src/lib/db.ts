import { Message, Thread } from '@/dexie';
import { tryCatch } from '@/lib/utils';
import { Redis } from '@upstash/redis';
import SuperJSON from 'superjson';

function mapToObject(map: Map<string, string>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

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

export async function syncMessages(input: { userId: string; messages: Message[] }) {
  const kvMap = new Map<string, string | null>(
    input.messages
      .filter((m) => m.id && m.threadId)
      .map((msg) => {
        if (msg.removed === 'true') {
          return [messageSyncKey(input.userId, msg.id), null];
        }
        return [messageSyncKey(input.userId, msg.id), SuperJSON.stringify(msg)];
      }),
  );

  const keys = [];
  const values = new Map<string, string>();
  for (const [key, value] of kvMap) {
    if (value === null) {
      keys.push(key);
    } else {
      values.set(key, value);
    }
  }

  await redis.del(...keys);
  await redis.mset(mapToObject(values));
  console.log('[SYNC] Synced', input.messages.length, 'messages');
}

export async function getAllMessagesForUser(userId: string) {
  const keys = await redis.keys(`sync:msg:${userId}:*`);
  if (keys.length === 0) return [];
  const messages = (await redis.mget(keys)).filter((message) => message !== null).map((message) => message);
  console.log('[SYNC] Fetched', messages.length, 'messages');
  const parsedMessages = messages.map((message) => (message as { json: Message }).json);
  return parsedMessages;
}

export async function syncThreads(input: { userId: string; threads: Thread[] }) {
  const kvMap = new Map<string, string | null>(
    input.threads
      .filter((thread) => thread.id)
      .map((thread) => {
        if (thread.removed === 'true') {
          return [threadSyncKey(input.userId, thread.id), null];
        }
        return [threadSyncKey(input.userId, thread.id), SuperJSON.stringify(thread)];
      }),
  );

  const keys = [];
  const values = new Map<string, string>();
  for (const [key, value] of kvMap) {
    if (value === null) {
      keys.push(key);
    } else {
      values.set(key, value);
    }
  }

  await redis.del(...keys);
  await redis.mset(mapToObject(values));
  console.log('[SYNC] Synced', input.threads.length, 'threads');
}

export async function getAllThreadsForUser(userId: string) {
  const keys = await redis.keys(`sync:thread:${userId}:*`);
  if (keys.length === 0) return [];
  const { data: kvThreads, error } = await tryCatch(redis.mget(keys));
  if (error) {
    console.log('[SYNC] Error getting threads:', error);
    return [];
  }
  const threads = kvThreads.filter((thread) => thread !== null).map((thread) => thread as { json: Thread });
  if (threads.length === 0) return [];

  console.log('[SYNC] Fetched', threads.length, 'threads');
  const parsedThreads = threads.map((thread) => thread.json);
  return parsedThreads;
}

export async function deleteUserData(userId: string) {
  const threadKeys = await redis.keys(`sync:thread:${userId}:*`);
  const messagesKeys = await redis.keys(`sync:msg:${userId}:*`);
  await redis.del(...threadKeys, ...messagesKeys);
  console.log('[SYNC] Deleted user data for ', userId);
}
