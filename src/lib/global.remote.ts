import { env } from '../env';
import { messageSchema, threadSchema } from '$lib/dexie';
import { apiRoute, tryCatch } from '$lib/utils';
import {
	addAdminDb,
	dbSync,
	deleteSyncDb,
	deleteUserDataDb,
	exportThreadToDb,
	getAdminsDb,
	getAllUserShortenedUrlsDb,
	getShortenedUrlDb,
	removeAdminDb,
	setShortenedUrlDb
} from '$lib/server/redis.server';
import { query } from '$app/server';
import { z } from 'zod';

/**
 * Fetches the system prompt from the server.
 * @returns A promise that resolves to the system prompt text.
 */
export const fetchSystemPrompt = query(async () => {
	const { data, error } = await tryCatch(fetch(apiRoute('/system-prompt')));
	if (error) {
		return null;
	}
	return await data.text();
});

/**
 * Checks if the current environment is development.
 * @returns A promise that resolves to a boolean indicating if the environment is development.
 */
export const checkDevMode = query(async (): Promise<boolean> => {
	const environment = env.NODE_ENV;

	if (environment === 'development') {
		console.log('[DEV] Development mode enabled');
		return true;
	}
	return false;
});

/**
 * Synchronizes the database with the remote data.
 * @param data An object containing the threads and messages to sync.
 * @param userId The user ID to sync data with.
 * @returns An object containing any new threads and messages found in the remote data.
 */
export const sync = query(
	z.object({
		data: z.object({
			threads: threadSchema.array(),
			messages: messageSchema.array()
		}),
		userId: z.string()
	}),
	async (slug) => {
		const { messages: newMessages, threads: newThreads } = await dbSync({
			userId: slug.userId,
			threads: slug.data.threads,
			messages: slug.data.messages
		});
		return { threads: newThreads, messages: newMessages };
	}
);

/**
 * Deletes all data associated with a user.
 * @param userId The user ID for which data should be deleted.
 */
export const deleteUserData = query(z.object({ userId: z.string() }), async (slug) => {
	await deleteUserDataDb(slug.userId);
});

/**
 * Deletes all sync data from the key-value store.
 * @returns A promise that resolves when the sync data has been deleted.
 */
export const deleteSync = query(async () => {
	await deleteSyncDb();
});

export const addAdmin = query(z.object({ email: z.string().email() }), async (slug) => {
	await addAdminDb(slug.email);
});

export const removeAdmin = query(z.object({ email: z.string().email() }), async (slug) => {
	await removeAdminDb(slug.email);
});

export const getAdmins = query(async () => {
	return await getAdminsDb();
});

export const checkIsAdmin = query(z.object({ userId: z.string() }), async (slug) => {
	const admins = await getAdminsDb();
	return admins.includes(slug.userId);
});

export const exportThread = query(
	z.object({
		userId: z.string(),
		data: z.object({ messages: messageSchema.array(), thread: threadSchema })
	}),
	async (slug) => {
		await exportThreadToDb(slug.userId, slug.data);
	}
);

export const setShortenedUrl = query(
	z.object({ userId: z.string(), id: z.string(), url: z.string() }),
	async (slug) => {
		await setShortenedUrlDb(slug.userId, slug.id, slug.url);
	}
);

export const getShortenedUrl = query(z.object({ id: z.string() }), async (slug) => {
	return await getShortenedUrlDb(slug.id);
});

export const getAllUserShortenedUrls = query(z.object({ userId: z.string() }), async (slug) => {
	return await getAllUserShortenedUrlsDb(slug.userId);
});
