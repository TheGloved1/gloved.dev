'use server';
import { env } from '@/env';
import { Message, Thread } from '@/lib/dexie';
import { apiRoute, tryCatch } from '@/lib/utils';
import { addAdmin, dbSync, deleteSync, deleteUserData, getAdmins, removeAdmin } from './redis';

/**
 * Fetches the system prompt from the server.
 * @returns A promise that resolves to the system prompt text.
 */
export async function fetchSystemPrompt() {
  const { data, error } = await tryCatch(fetch(apiRoute('/system-prompt')));
  if (error) {
    return null;
  }
  return await data.text();
}

/**
 * Checks if the current environment is development.
 * @returns A promise that resolves to a boolean indicating if the environment is development.
 */
export async function checkDevMode(): Promise<boolean> {
  const environment = env.NODE_ENV;

  if (environment === 'development') {
    console.log('[DEV] Development mode enabled');
    return true;
  }
  return false;
}

/**
 * Synchronizes the database with the remote data.
 * @param data An object containing the threads and messages to sync.
 * @param userId The user ID to sync data with.
 * @returns An object containing any new threads and messages found in the remote data.
 */
export async function syncAction(data: { threads: Thread[]; messages: Message[] }, userId: string) {
  const { messages: newMessages, threads: newThreads } = await dbSync({
    userId,
    threads: data.threads,
    messages: data.messages,
  });
  return { threads: newThreads, messages: newMessages };
}

/**
 * Deletes all data associated with a user.
 * @param userId The user ID for which data should be deleted.
 */
export async function deleteUserDataAction(userId: string) {
  await deleteUserData(userId);
}

/**
 * Deletes all sync data from the key-value store.
 * @returns A promise that resolves when the sync data has been deleted.
 */
export async function deleteSyncAction() {
  await deleteSync();
}

export async function addAdminAction(email: string) {
  await addAdmin(email);
}

export async function removeAdminAction(email: string) {
  await removeAdmin(email);
}

export async function getAdminsAction() {
  return await getAdmins();
}

export async function checkIfAdminAction(email: string) {
  const admins = await getAdmins();
  return admins.includes(email);
}
