'use client'
import { checkDevMode } from '@/lib/actions'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import ErrorAlert from './ErrorAlert'
import Loading from './loading'

export default function DevModeOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }): React.JSX.Element {
  const isDev = useQuery({ queryKey: ['devMode'], queryFn: checkDevMode, initialData: false })
  if (isDev.isError) return <ErrorAlert>{isDev.error.message}</ErrorAlert>
  if (isDev.isFetching) return <Loading />
  return <>{isDev.data ? children : fallback}</>
}
