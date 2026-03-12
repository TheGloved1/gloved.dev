'use server';
import { env } from '@/env';
import { Message, Thread } from '@/lib/dexie';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { embed, embedMany } from 'ai';
import { generateChunks } from './ai';
import glovedApi from './glovedapi';
import { rateLimiter } from './rate-limiter';
import {
  addAdmin,
  addGroceryItem,
  dbSync,
  deleteSync,
  deleteUserData,
  exportThreadToDb,
  getAdmins,
  getAllUserShortenedUrls,
  getGroceryLists,
  getShortenedUrl,
  moveGroceryItem,
  removeAdmin,
  removeGroceryItem,
  setShortenedUrl,
} from './redis';

export async function getUUID(): Promise<string> {
  return crypto.randomUUID();
}

/**
 * Fetches the system prompt from the server.
 * @returns A promise that resolves to the system prompt text.
 */
export async function fetchSystemPrompt() {
  return glovedApi.getSystemPrompt();
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
  return await removeAdmin(email);
}

export async function getAdminsAction() {
  return await getAdmins();
}

export async function checkIsAdminAction(email: string) {
  const admins = await getAdmins();
  return admins.includes(email);
}

export async function exportThreadAction(userId: string, data: { messages: Message[]; thread: Thread }) {
  await exportThreadToDb(userId, data);
}

export async function setShortenedUrlAction(userId: string, id: string, url: string) {
  await setShortenedUrl(userId, id, url);
}

export async function getShortenedUrlAction(id: string) {
  return await getShortenedUrl(id);
}

export async function getAllUserShortenedUrlsAction(userId: string) {
  return await getAllUserShortenedUrls(userId);
}

const openrouter = createOpenRouter({ apiKey: env.OPENROUTER });
const embedModel = openrouter.textEmbeddingModel('nvidia/llama-nemotron-embed-vl-1b-v2:free');

/**
 * Generates embeddings for each line in the provided string value.
 * @param value The string value to generate embeddings for.
 * @returns A promise that resolves to an array of objects containing the embedding and the corresponding content.
 */
export const generateEmbeddings = async (value: string): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embedModel,
    values: chunks,
  });
  return embeddings.map((e: number[], i: number) => ({ content: chunks[i], embedding: e }));
};

/**
 * Generates a single embedding for a given string value.
 * @param value The string value to generate an embedding for.
 * @returns A promise that resolves to the generated embedding as a number array.
 */
export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embedModel,
    value: input,
  });
  return embedding;
};

export async function getGroceryListsAction() {
  try {
    return await getGroceryLists();
  } catch (error) {
    console.error('Error fetching grocery lists:', error);
    throw new Error('Failed to fetch grocery lists');
  }
}

export async function addGroceryItemAction(listKey: 'shopping-list' | 'have-list', text: string, identifier?: string) {
  try {
    // Use identifier for rate limiting (either userName or clientIP)
    if (!identifier) {
      throw new Error('User identifier is required');
    }

    const rateLimit = rateLimiter.checkRateLimit(identifier);

    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Item text is required');
    }

    if (text.trim().length > 100) {
      throw new Error('Item text must be 100 characters or less');
    }

    // Use identifier for attribution (userName or 'unknown' for IP)
    const attributedName = identifier.includes('@') || identifier.includes('.') ? 'unknown' : identifier;

    const item = {
      id: crypto.randomUUID(),
      text: text.trim(),
      addedAt: Date.now(),
      addedBy: attributedName,
    };

    await addGroceryItem(listKey, item);
    return { success: true };
  } catch (error) {
    console.error('Error adding grocery item:', error);
    throw error;
  }
}

export async function removeGroceryItemAction(listKey: 'shopping-list' | 'have-list', itemId: string, identifier?: string) {
  try {
    // Use identifier for rate limiting (either userName or clientIP)
    if (!identifier) {
      throw new Error('User identifier is required');
    }

    const rateLimit = rateLimiter.checkRateLimit(identifier);

    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!itemId) {
      throw new Error('Item ID is required');
    }

    await removeGroceryItem(listKey, itemId);
    return { success: true };
  } catch (error) {
    console.error('Error removing grocery item:', error);
    throw error;
  }
}

export async function moveGroceryItemAction(
  fromListKey: 'shopping-list' | 'have-list',
  toListKey: 'shopping-list' | 'have-list',
  itemId: string,
  identifier?: string,
) {
  try {
    // Use identifier for rate limiting (either userName or clientIP)
    if (!identifier) {
      throw new Error('User identifier is required');
    }

    const rateLimit = rateLimiter.checkRateLimit(identifier);

    if (!rateLimit.allowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (!itemId) {
      throw new Error('Item ID is required');
    }

    await moveGroceryItem(fromListKey, toListKey, itemId);
    return { success: true };
  } catch (error) {
    console.error('Error moving grocery item:', error);
    throw error;
  }
}
