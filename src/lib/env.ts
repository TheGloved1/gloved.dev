import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_FILE_MANAGER_PASSKEY: z.string(),
})

const { NEXT_PUBLIC_FILE_MANAGER_PASSKEY } = process.env

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_FILE_MANAGER_PASSKEY,
})

if (!parsedEnv.success) {
  console.error(parsedEnv.error)
  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data
