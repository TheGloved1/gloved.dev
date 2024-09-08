'use client'

import { useTransition, useState, useEffect } from 'react'
import { startDiscordBot, stopDiscordBot, getBotStatus } from '@/lib/actions'

export default function BotButtons(): React.JSX.Element {
  const [isPendingStart, startTransitionStart] = useTransition()
  const [isPendingStop, startTransitionStop] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [startButtonText, setStartButtonText] = useState<string>('Start Bot')
  const [stopButtonText, setStopButtonText] = useState<string>('Stop Bot')
  const [isDisabled, setIsDisabled] = useState<boolean>(true)
  const [isBotRunning, setIsBotRunning] = useState<boolean>(false)

  useEffect(() => {
    // Check if the bot is running when the component mounts
    const checkBotStatus = async () => {
      try {
        const status = await getBotStatus()
        setIsBotRunning(status.isRunning)
        setIsDisabled(false) // Enable buttons after checking status
      } catch (error) {
        console.error('Failed to check bot status:', error)
      }
    }

    checkBotStatus()
  }, [])

  const handleStartBot = () => {
    startTransitionStart(async () => {
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
        }, 500)
      } catch (error) {
        console.error((error as Error).message)
        setError((error as Error).message) // Set the error message
      }
    })
  }

  const handleStopBot = () => {
    startTransitionStop(async () => {
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
        }, 500)
      } catch (error) {
        console.error((error as Error).message)
        setError((error as Error).message) // Set the error message
      }
    })
  }

  return (
    <div>
      <button className='btn mx-4' onClick={handleStartBot} disabled={isPendingStart || isDisabled || isBotRunning}>
        {isPendingStart ?
          'Starting Bot...'
        : isBotRunning ?
          'Discord Bot is Online...'
        : startButtonText}
      </button>
      <button className='btn mx-4' onClick={handleStopBot} disabled={isPendingStop || isDisabled || !isBotRunning}>
        {isPendingStop ?
          'Stopping Bot...'
        : !isBotRunning ?
          'Discord Bot is Offline...'
        : stopButtonText}
      </button>
      {error && <p className='alert-error'>{error}</p>}
    </div>
  )
}
