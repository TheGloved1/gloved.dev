'use client'
import { useFetchIp } from '@/lib/hooks'
import Loading from '@/components/loading'
import React, { useEffect, useState } from 'react'
import { apiRoute } from '@/lib/utils'

export default function AdminComponent({ children }: { children: React.ReactNode }): React.JSX.Element | null {
  const fetchIps = async () => {
    const res = await fetch(apiRoute('/admin-ips'))
    return (await res.json()) as Promise<string[]>
  }
  const [allowedIps, setAllowedIps] = useState<string[]>([])
  const { clientIp, loading } = useFetchIp()

  useEffect(() => {
    const fetchAllowedIps = async () => {
      const ips = await fetchIps()
      setAllowedIps(ips)
    }
    fetchAllowedIps()
  }, [])

  if (loading || clientIp === '' || allowedIps.length === 0) {
    return <Loading />
  }

  const isAllowed = allowedIps.includes(clientIp)

  if (!isAllowed) {
    console.log('Client IP is not allowed')
  } else {
    console.log('Client IP is allowed')
  }

  return isAllowed ? <>{children}</> : null
}
