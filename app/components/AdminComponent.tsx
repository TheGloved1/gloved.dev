import Loading from '@/components/Loading'
import React from 'react'
import { apiRoute } from '@/lib/utils'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

// Fetch client IP using axios
const fetchClientIp = async () => {
  const response = await axios.get('https://api64.ipify.org?format=json')
  return response.data.ip
}

// Fetch allowed IPs from the API
const fetchAllowedIps = async () => {
  const res = await fetch(apiRoute('/admin-ips'))
  return res.json() as Promise<string[]>
}

export default function AdminComponent({ children }: { children: React.ReactNode }): React.JSX.Element | null {
  const { data: clientIp, isLoading: isClientIpLoading, isError: isClientIpError } = useQuery({ queryKey: ['clientIp'], queryFn: fetchClientIp })
  const { data: allowedIps, isLoading: isAllowedIpsLoading, isError: isAllowedIpsError } = useQuery({ queryKey: ['allowedIps'], queryFn: fetchAllowedIps })

  if (isClientIpLoading || isAllowedIpsLoading) {
    return <Loading />
  }

  if (isClientIpError || isAllowedIpsError || !clientIp || !allowedIps) {
    console.error('Failed to fetch data')
    return null
  }

  const isAllowed = allowedIps.includes(clientIp)

  if (!isAllowed) {
    console.log('Client IP is not allowed')
  } else {
    console.log('Client IP is allowed')
  }

  return isAllowed ? <>{children}</> : null
}
