'use client'
import { apiRoute } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import ErrorAlert from './ErrorAlert'

const startDiscordBot = async (): Promise<{ message: string }> => {
  const response: AxiosResponse<{ message: string }> = await axios.post(apiRoute('/bot/start'))
  if (response.status !== 200) throw new Error('Failed to start bot')
  return response.data
}

const stopDiscordBot = async (): Promise<{ message: string }> => {
  const response: AxiosResponse<{ message: string }> = await axios.post(apiRoute('/bot/stop'))
  if (response.status !== 200) throw new Error('Failed to stop bot')
  return response.data
}

const getBotStatus = async (): Promise<{ isRunning: boolean }> => {
  const response: AxiosResponse<{ isRunning: boolean }> = await axios.get(apiRoute('/bot/status'))
  if (response.status !== 200) throw new Error('Failed to fetch bot status')
  return response.data
}

export default function BotButtons(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [startButtonText, setStartButtonText] = useState<string>('Start Bot')
  const [stopButtonText, setStopButtonText] = useState<string>('Stop Bot')

  const botStatusKey = ['botStatus']

  const botStatusQuery = useQuery({
    queryKey: botStatusKey,
    queryFn: getBotStatus,
    initialData: { isRunning: false },
  })

  useEffect(() => {
    if (botStatusQuery.isError) {
      setError('Failed to fetch bot status')
    }
  }, [botStatusQuery.isError])

  const startBotMutation = useMutation({
    mutationFn: startDiscordBot,
    onSuccess: (data) => {
      setStartButtonText(data.message)
      setError(null)
      queryClient.invalidateQueries({ queryKey: botStatusKey })
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
      queryClient.invalidateQueries({ queryKey: botStatusKey })
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

  return (
    <div>
      <button
        className='btn mx-4'
        onClick={handleStartBot}
        disabled={startBotMutation.isPending || botStatusQuery.isPending || botStatusQuery.data?.isRunning}
      >
        {startBotMutation.isPending ?
          'Starting Bot...'
        : botStatusQuery.data?.isRunning ?
          'Discord Bot is Online...'
        : startButtonText}
      </button>
      <button
        className='btn mx-4'
        onClick={handleStopBot}
        disabled={stopBotMutation.isPending || botStatusQuery.isPending || !botStatusQuery.data?.isRunning}
      >
        {stopBotMutation.isPending ?
          'Stopping Bot...'
        : !botStatusQuery.data?.isRunning ?
          'Discord Bot is Offline...'
        : stopButtonText}
      </button>
      {error && <ErrorAlert>{error}</ErrorAlert>}
    </div>
  )
}
