'use client'
import { useFetchIp } from '@/lib/hooks'
import Loading from '@/components/loading'
import React from 'react'

export default function AdminComponent(props: { children: React.ReactNode }): React.JSX.Element | null {
  const allowedIp = '207.199.235.110'
  const { clientIp, loading } = useFetchIp()

  if (loading) {
    return <Loading />
  }

  return clientIp === allowedIp ? <>{props.children}</> : null
}
