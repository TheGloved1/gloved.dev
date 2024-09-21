import { z } from 'zod'

const envSchema = z.object({
  VITE_FILE_MANAGER_PASSKEY: z.string(),
})

const { VITE_FILE_MANAGER_PASSKEY } = import.meta.env

const parsedEnv = envSchema.safeParse({
  VITE_FILE_MANAGER_PASSKEY,
})

if (!parsedEnv.success) {
  console.error(parsedEnv.error)
  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data
