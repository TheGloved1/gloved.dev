import { createEnv } from '@t3-oss/env-core';
import 'dotenv/config';
import { z } from 'zod';

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here.
	 */
	server: {
		GEMINI: z.string(),
		GROQ: z.string(),
		OPENROUTER: z.string(),
		CLERK_SECRET_KEY: z.string(),
		KV_URL: z.string(),
		KV_REST_API_URL: z.string(),
		KV_REST_API_TOKEN: z.string(),
		KV_REST_API_READ_ONLY_TOKEN: z.string(),
		NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
	},

	/**
	 * Specify your client-side environment variables schema here.
	 */
	client: {
		PUBLIC_FILE_MANAGER_PASSKEY: z.string(),
		PUBLIC_CLERK_PUBLISHABLE_KEY: z.string()
	},

	/**
	 * Specify your runtime environment variables schema here.
	 */
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		GEMINI: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
		GROQ: process.env.GROQ_API_KEY,
		OPENROUTER: process.env.OPENROUTER,
		KV_URL: process.env.KV_URL,
		KV_REST_API_URL: process.env.KV_REST_API_URL,
		KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
		KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,
		PUBLIC_FILE_MANAGER_PASSKEY: process.env.PUBLIC_FILE_MANAGER_PASSKEY,
		PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
		CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY
	},

	clientPrefix: 'PUBLIC_',
	emptyStringAsUndefined: true
});
