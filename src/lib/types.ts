export const Role = {
  USER: 'user',
  MODEL: 'assistant',
} as const

export type RoleType = (typeof Role)[keyof typeof Role]
