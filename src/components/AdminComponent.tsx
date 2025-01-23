'use client'
import Loading from '@/components/loading'
import { apiRoute } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'

async function fetchClientIp() {
  const response = await axios.get<{ ip: string }>('https://api64.ipify.org?format=json')
  console.log('Client IP:', response.data.ip)
  return response.data.ip
}

async function fetchAllowedIps() {
  const res = await axios.get<string[]>(apiRoute('/admin-ips'))
  return res.data
}

export default function AdminComponent({ children }: { children: React.ReactNode }): React.JSX.Element {
  const clientIp = useQuery<string>({ queryKey: ['clientIp'], queryFn: fetchClientIp })
  const allowedIps = useQuery<string[]>({
    queryKey: ['allowedIps'],
    queryFn: fetchAllowedIps,
    refetchOnWindowFocus: true,
  })

  const isLoading = clientIp.isLoading || allowedIps.isLoading
  const isErrored = clientIp.isError || allowedIps.isError
  const isAllowed = allowedIps.data?.includes(clientIp.data ?? '') ?? false

  if (isErrored) {
    return <></>
  }

  if (isLoading) {
    return <Loading />
  }

  if (isAllowed) {
    return <>{children}</>
  }

  return <></>
}
