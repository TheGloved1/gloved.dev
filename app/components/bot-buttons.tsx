'use client'
import { apiRoute } from '@/lib/utils'
import { useTransition, useState, useEffect } from 'react'

async function startDiscordBot() {
  try {
    const result = (await fetch(apiRoute('/bot/start'), {
      method: 'POST',
    }).then((res) => res.json())) as { message: string }
    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to start bot')
  }
}

async function stopDiscordBot() {
  try {
    const result = (await fetch(apiRoute('/bot/stop'), {
      method: 'POST',
    }).then((res) => res.json())) as { message: string }
    return result
  } catch (error) {
    console.error(error)
    throw new Error('Failed to stop bot')
  }
}

async function getBotStatus() {
  const status = (await fetch(apiRoute('/bot/status')).then((res) => res.json())) as { isRunning: boolean }
  return status
}

export default function BotButtons(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [startButtonText, setStartButtonText] = useState<string>('Start Bot')
  const [stopButtonText, setStopButtonText] = useState<string>('Stop Bot')
  const [isDisabled, setIsDisabled] = useState<boolean>(true)
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false)

  const checkBotStatus = async () => {
    try {
      const status = await getBotStatus()
      setIsBotRunning(status.isRunning)
      setIsDisabled(false) // Enable buttons after checking status
    } catch (error) {
      console.error('Failed to check bot status:', error)
    }
  }

  useEffect(() => {
    // Check if the bot is running when the component mounts
    checkBotStatus()

    // Set up interval to check bot status every 5 seconds
    // const intervalId = setInterval(async () => await checkBotStatus(), 5000)

    // Clean up interval when the component unmounts
    // return () => clearInterval(intervalId)
  }, [])

  const handleStartBot = () => {
    startTransition(() => {
      ;(async () => {
        try {
          const result = await startDiscordBot()
          console.log(result.message)
          setStartButtonText(result.message)
          setError(null) // Clear any previous errors
          setIsDisabled(true)
          setIsBotRunning(true)
          setTimeout(() => {
            setStartButtonText('Start Bot')
            setIsDisabled(false)
          }, 1000)
        } catch (error) {
          console.error((error as Error).message)
          setError((error as Error).message) // Set the error message
        }
      })()
    })
  }

  const handleStopBot = () => {
    startTransition(() => {
      ;(async () => {
        try {
          const result = await stopDiscordBot()
          console.log(result.message)
          setStopButtonText(result.message)
          setError(null) // Clear any previous errors
          setIsDisabled(true)
          setIsBotRunning(false)
          setTimeout(() => {
            setStopButtonText('Stop Bot')
            setIsDisabled(false)
          }, 1000)
        } catch (error) {
          console.error((error as Error).message)
          setError((error as Error).message) // Set the error message
        }
      })()
    })
  }

  return (
    <div>
      <button className='btn mx-4' onClick={handleStartBot} disabled={isPending || isDisabled || isBotRunning}>
        {isPending ?
          'Starting Bot...'
        : isBotRunning ?
          'Discord Bot is Online...'
        : startButtonText}
      </button>
      <button className='btn mx-4' onClick={handleStopBot} disabled={isPending || isDisabled || !isBotRunning}>
        {isPending ?
          'Stopping Bot...'
        : !isBotRunning ?
          'Discord Bot is Offline...'
        : stopButtonText}
      </button>
      {error && <p className='alert-error'>{error}</p>}
    </div>
  )
}
