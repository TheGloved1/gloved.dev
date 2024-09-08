'use server'

import { runBot, stopBot, bot } from '@/discord/main'

export async function startDiscordBot() {
  try {
    const result = await runBot()
    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to start bot')
  }
}
export async function stopDiscordBot() {
  try {
    const result = await stopBot()
    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to stop bot')
  }
}

export async function getBotStatus() {
  return { isRunning: bot.isReady() }
}
