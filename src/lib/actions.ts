'use server'

export async function startDiscordBot() {
  try {
    const result = (await fetch('https://api/gloved.dev/bot/start').then((res) => res.json())) as { message: string }
    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to start bot')
  }
}

export async function stopDiscordBot() {
  try {
    const result = (await fetch('https://api/gloved.dev/bot/stop').then((res) => res.json())) as { message: string }
    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to stop bot')
  }
}

export async function getBotStatus() {
  const status = (await fetch('https://api.gloved.dev/bot/status').then((res) => res.json())) as { isRunning: boolean }
  return status
}
