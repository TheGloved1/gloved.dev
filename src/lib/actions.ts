'use server';
import { Message, Thread } from '@/dexie';
import { env } from '@/env';
import { apiRoute, tryCatch } from '@/lib/utils';
import { deleteUserData, getAllMessagesForUser, getAllThreadsForUser, syncData } from './db';

export async function fetchSystemPrompt() {
  const { data, error } = await tryCatch(fetch(apiRoute('/system-prompt')));
  if (error) {
    return '';
  }
  return await data.text();
}

export async function checkDevMode(): Promise<boolean> {
  const environment = env.NODE_ENV;

  if (environment === 'development') {
    return true;
  }
  return false;
}

export async function sync(data: { threads: Thread[]; messages: Message[] }, userId: string) {
  const { messages, threads } = await syncData({ userId, threads: data.threads, messages: data.messages });
  return { threads, messages };
}

export async function syncDbFromServer(userId: string) {
  const [threads, messages] = await Promise.all([getAllThreadsForUser(userId), getAllMessagesForUser(userId)]);
  return { threads, messages } as { threads: Thread[]; messages: Message[] };
}

export async function deleteData(userId: string) {
  await deleteUserData(userId);
  console.log('[SYNC] Deleted user data for ', userId);
}
