import { z } from 'zod'

const envSchema = z.object({
  CLIENT_ENV_FILE_MANAGER_PASSKEY: z.string(),
})

const { CLIENT_ENV_FILE_MANAGER_PASSKEY } = {
  CLIENT_ENV_FILE_MANAGER_PASSKEY: '7693',
}

const parsedEnv = envSchema.safeParse({
  CLIENT_ENV_FILE_MANAGER_PASSKEY,
})

if (!parsedEnv.success) {
  console.error(parsedEnv.error)
  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data
