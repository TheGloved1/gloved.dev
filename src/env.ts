import { createEnv } from '@t3-oss/env-nextjs'
import 'dotenv/config'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   */
  server: {
    GEMINI: z.string(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  /**
   * Specify your client-side environment variables schema here.
   */
  client: {
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    GEMINI: process.env.GEMINI,
    NEXT_PUBLIC_FILE_MANAGER_PASSKEY: process.env.NEXT_PUBLIC_FILE_MANAGER_PASSKEY,
  },

  emptyStringAsUndefined: true,
})
