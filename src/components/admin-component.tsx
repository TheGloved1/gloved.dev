'use client'
import { useFetchIp } from '@/lib/hooks'
import Loading from '@/components/loading'
import React from 'react'

export default function AdminComponent({ children }: { children: React.ReactNode }): React.JSX.Element | null {
  const allowedIps = ['207.199.235.110', '216.248.102.160']
  const { clientIp, loading } = useFetchIp()

  if (loading) {
    return <Loading />
  }

  const isAllowed = clientIp !== null && allowedIps.includes(clientIp)

  if (!isAllowed) {
    console.log('Client IP is not allowed')
  } else {
    console.log('Client IP is allowed')
  }

  return isAllowed ? <>{children}</> : null
}
