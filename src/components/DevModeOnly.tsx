'use client'
import { checkDevMode } from '@/lib/actions'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import ErrorAlert from './ErrorAlert'
import Loading from './loading'

type DevModeOnlyProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function DevModeOnly({ children, fallback }: DevModeOnlyProps): React.JSX.Element {
  const isDev = useQuery({ queryKey: ['devMode'], queryFn: checkDevMode })
  if (isDev.isError) return <ErrorAlert>{isDev.error.message}</ErrorAlert>
  if (isDev.isFetching) return <Loading />
  return <>{isDev.data ? children : fallback}</>
}
