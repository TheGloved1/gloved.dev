import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  NEXT_PUBLIC_FILE_MANAGER_PASSKEY: z.string(),
})

const { NEXT_PUBLIC_FILE_MANAGER_PASSKEY } = {
  NEXT_PUBLIC_FILE_MANAGER_PASSKEY: process.env.NEXT_PUBLIC_FILE_MANAGER_PASSKEY,
}

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_FILE_MANAGER_PASSKEY,
})

if (!parsedEnv.success) {
  console.error(parsedEnv.error)
  throw new Error('Invalid environment variables', parsedEnv.error)
}

export const env = parsedEnv.data
