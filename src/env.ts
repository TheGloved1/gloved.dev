import { createEnv } from '@t3-oss/env-nextjs';
import 'dotenv/config';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   */
  server: {
    GEMINI: z.string(),
    GROQ: z.string(),
    CLERK_SECRET_KEY: z.string(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Specify your client-side environment variables schema here.
   */
  client: {
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },

  /**
   * Specify your runtime environment variables schema here.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    GEMINI: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GROQ: process.env.GROQ_API_KEY,
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: process.env.NEXT_PUBLIC_FILE_MANAGER_PASSKEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },

  emptyStringAsUndefined: true,
});
