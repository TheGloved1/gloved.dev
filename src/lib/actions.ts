'use server';
import { Message, Thread } from '@/dexie';
import { env } from '@/env';
import { apiRoute, tryCatch } from '@/lib/utils';
import { dbSync, deleteUserData } from './db';

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

export async function syncAction(data: { threads: Thread[]; messages: Message[] }, userId: string) {
  const { messages: newMessages, threads: newThreads } = await dbSync({
    userId,
    threads: data.threads,
    messages: data.messages,
  });
  return { threads: newThreads, messages: newMessages };
}

export async function deleteDataAction(userId: string) {
  await deleteUserData(userId);
  console.log('[SYNC] Deleted user data for ', userId);
}
