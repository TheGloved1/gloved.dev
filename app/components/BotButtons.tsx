'use client'
import { apiRoute } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const startDiscordBot = async () => {
  const response = await fetch(apiRoute('/bot/start'), { method: 'POST' })
  if (!response.ok) throw new Error('Failed to start bot')
  return response.json() as Promise<{ message: string }>
}

const stopDiscordBot = async () => {
  const response = await fetch(apiRoute('/bot/stop'), { method: 'POST' })
  if (!response.ok) throw new Error('Failed to stop bot')
  return response.json() as Promise<{ message: string }>
}

const getBotStatus = async () => {
  const response = await fetch(apiRoute('/bot/status'))
  if (!response.ok) throw new Error('Failed to fetch bot status')
  return response.json() as Promise<{ isRunning: boolean }>
}

export default function BotButtons(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [startButtonText, setStartButtonText] = useState<string>('Start Bot')
  const [stopButtonText, setStopButtonText] = useState<string>('Stop Bot')

  const {
    data: botStatus,
    isLoading: isStatusLoading,
    isError: isStatusError,
  } = useQuery({
    queryKey: ['botStatus'],
    queryFn: getBotStatus,
    initialData: { isRunning: false },
  })

  const startBotMutation = useMutation({
    mutationFn: startDiscordBot,
    onSuccess: (data) => {
      setStartButtonText(data.message)
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['botStatus'] })
      setTimeout(() => setStartButtonText('Start Bot'), 1000)
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const stopBotMutation = useMutation({
    mutationFn: stopDiscordBot,
    onSuccess: (data) => {
      setStopButtonText(data.message)
      setError(null)
      queryClient.invalidateQueries({ queryKey: ['botStatus'] })
      setTimeout(() => setStopButtonText('Stop Bot'), 1000)
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const handleStartBot = () => {
    startBotMutation.mutate()
  }

  const handleStopBot = () => {
    stopBotMutation.mutate()
  }

  useEffect(() => {
    if (isStatusError) {
      setError('Failed to fetch bot status')
    }
  }, [isStatusError])

  const isBotRunning = botStatus?.isRunning ?? false

  return (
    <div>
      <button className='btn mx-4' onClick={handleStartBot} disabled={isStatusLoading || startBotMutation.isPending || isBotRunning}>
        {startBotMutation.isPending ?
          'Starting Bot...'
        : isBotRunning ?
          'Discord Bot is Online...'
        : startButtonText}
      </button>
      <button className='btn mx-4' onClick={handleStopBot} disabled={isStatusLoading || stopBotMutation.isPending || !isBotRunning}>
        {stopBotMutation.isPending ?
          'Stopping Bot...'
        : !isBotRunning ?
          'Discord Bot is Offline...'
        : stopButtonText}
      </button>
      {error && <p className='alert-error'>{error}</p>}
    </div>
  )
}
