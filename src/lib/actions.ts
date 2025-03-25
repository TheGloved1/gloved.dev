'use server';
import { env } from '@/env';
import { Message, Thread } from '@/lib/dexie';
import { apiRoute, tryCatch } from '@/lib/utils';
import { IgDownloader } from 'ig-downloader';
import { addAdmin, dbSync, deleteSync, deleteUserData, getAdmins, removeAdmin } from './db';

/**
 * Fetches the system prompt from the server.
 * @returns A promise that resolves to the system prompt text.
 */
export async function fetchSystemPrompt() {
  const { data, error } = await tryCatch(fetch(apiRoute('/system-prompt')));
  if (error) {
    return '';
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

/**
 * Posts a file to Discord.
 * @param url The URL of the file to post.
 * @param type The type of the file (video or image).
 * @returns An object containing the post and success status.
 */
async function postToDiscord(url: string, type: 'video' | 'image') {
  const response = await fetch(url);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob, type === 'video' ? 'video.mp4' : 'image.jpg');

  const webhookUrl =
    'https://discord.com/api/webhooks/1348939145942405161/Yw1uZCyWalvDtYTTj-h499v0shalBvfhSx1rkptnlM7TTldnwecKioXr_Uh7iZawQgmc';
  await fetch(webhookUrl, {
    method: 'POST',
    body: formData,
  });
  return { url, type };
}

/**
 * Uploads a reel to Discord.
 * @param link The link to the reel to upload.
 * @returns An object containing the post and success status.
 */
export async function uploadReelAction(link: string) {
  const { data, error } = await tryCatch(IgDownloader(link));
  if (error) {
    return { post: null, success: false, error };
  }
  const { data: post, error: postError } = await tryCatch(
    postToDiscord(data.is_video ? data.video_url : data.display_url, data.is_video ? 'video' : 'image'),
  );
  if (postError) {
    return { post: null, success: false, error: postError };
  }
  return { post, success: true };
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
