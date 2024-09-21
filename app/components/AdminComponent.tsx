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
  const clientIp = useQuery({ queryKey: ['clientIp'], queryFn: fetchClientIp })
  const allowedIps = useQuery({ queryKey: ['allowedIps'], queryFn: fetchAllowedIps })

  if (clientIp.isLoading || allowedIps.isLoading) {
    return <Loading />
  }

  if (clientIp.isError || allowedIps.isError || !clientIp.data || !allowedIps.data) {
    console.error('Failed to fetch data')
    return <></>
  }

  const isAllowed = allowedIps.data.includes(clientIp.data)

  if (!isAllowed) {
    console.log('Client IP is not allowed')
  } else {
    console.log('Client IP is allowed')
  }

  return isAllowed ? <>{children}</> : <></>
}
