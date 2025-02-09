export const Role = {
  USER: 'user',
  MODEL: 'model',
} as const

export type RoleType = (typeof Role)[keyof typeof Role]

export type Message = {
  role: RoleType
  text: string
}
