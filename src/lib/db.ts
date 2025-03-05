import { Message, Thread } from '@/dexie';
import { tryCatch } from '@/lib/utils';
import { Redis } from '@upstash/redis';
import SuperJSON from 'superjson';

function mapToObject(map: Map<string, string | null>): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  map.forEach((value, key) => {
    if (value === null) return;
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

export async function getAllMessagesForUser(userId: string) {
  const keys = await redis.keys(`sync:msg:${userId}:*`);
  if (keys.length === 0) return [];
  const messages = (await redis.mget(keys)).filter((message) => message !== null).map((message) => message);
  console.log('[SYNC] Fetched', messages.length, 'messages');
  const parsedMessages = messages.map((message) => (message as { json: Message }).json);
  return parsedMessages;
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

export async function syncData(input: { userId: string; messages: Message[]; threads: Thread[] }) {
  const dbMessages = await getAllMessagesForUser(input.userId);
  const localMessages = input.messages;

  const dbThreads = await getAllThreadsForUser(input.userId);
  const localThreads = input.threads;

  const deletedKeys = new Set<string>();
  const kvMap: Record<string, string | null> = {};

  // Sync Messages
  localMessages.forEach((msg) => {
    const dbMessage = dbMessages.find((dbMsg) => dbMsg.id === msg.id);
    if (msg.id && !msg.removed) {
      if (!dbMessage || new Date(msg.created_at) > new Date(dbMessage.created_at)) {
        kvMap[messageSyncKey(input.userId, msg.id)] = SuperJSON.stringify(msg);
      } else {
        deletedKeys.add(messageSyncKey(input.userId, msg.id));
      }
    } else {
      deletedKeys.add(messageSyncKey(input.userId, msg.id));
    }
  });

  // Sync Threads
  localThreads.forEach((thread) => {
    const dbThread = dbThreads.find((dbThr) => dbThr.id === thread.id);
    if (thread.id && !thread.removed) {
      if (!dbThread || new Date(thread.updated_at) > new Date(dbThread.updated_at)) {
        kvMap[threadSyncKey(input.userId, thread.id)] = SuperJSON.stringify(thread);
      } else {
        deletedKeys.add(threadSyncKey(input.userId, thread.id));
      }
    } else {
      deletedKeys.add(threadSyncKey(input.userId, thread.id));
    }
  });

  // Execute Redis operations
  if (Object.keys(kvMap).length > 0) {
    await redis.del(...deletedKeys);
    await redis.mset(kvMap);
    console.log('[SYNC] Synced', Object.keys(kvMap).length, 'messages and threads');
  } else {
    console.log('[SYNC] No valid messages or threads to sync');
  }

  // Check for newer messages and threads
  const newerMessages = dbMessages.filter(
    (dbMsg) =>
      !localMessages.find((localMsg) => localMsg.id === dbMsg.id) ||
      new Date(dbMsg.created_at) > new Date(localMessages.find((localMsg) => localMsg.id === dbMsg.id)?.created_at || 0),
  );

  const newerThreads = dbThreads.filter(
    (dbThr) =>
      !localThreads.find((localThr) => localThr.id === dbThr.id) ||
      new Date(dbThr.updated_at) > new Date(localThreads.find((localThr) => localThr.id === dbThr.id)?.updated_at || 0),
  );

  console.log('[SYNC] Found', newerMessages.length, 'newer messages for', input.userId);
  console.log('[SYNC] Found', newerThreads.length, 'newer threads for', input.userId);

  return {
    messages: newerMessages,
    threads: newerThreads,
  };
}

export async function deleteUserData(userId: string) {
  const threadKeys = await redis.keys(`sync:thread:${userId}:*`);
  const messagesKeys = await redis.keys(`sync:msg:${userId}:*`);
  const keys = await redis.del(...threadKeys, ...messagesKeys);
  console.log('[SYNC] Deleted', keys, 'keys for', userId);
}
