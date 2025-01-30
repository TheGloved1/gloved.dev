import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  FILE_MANAGER_PASSKEY: z.string(),
  GEMINI: z.string().optional(),
})

const { FILE_MANAGER_PASSKEY, GEMINI } = {
  FILE_MANAGER_PASSKEY: process.env.NEXT_PUBLIC_FILE_MANAGER_PASSKEY,
  GEMINI: process.env.NEXT_PUBLIC_GEMINI,
}

const parsedEnv = envSchema.safeParse({
  FILE_MANAGER_PASSKEY,
  GEMINI,
})

if (!parsedEnv.success) {
  console.error(parsedEnv.error)
  throw new Error('Invalid environment variables', parsedEnv.error)
}

export const env = parsedEnv.data
