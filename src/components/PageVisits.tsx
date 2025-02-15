'use client'
import { apiRoute, fetchIp } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'

const getVisits = async () => {
  const ip = await fetchIp()
  if (!ip) throw new Error('Could not get client IP')
  const encodedIp = encodeURIComponent(ip)
  const pageVisits = await axios.get<{ visitorIps: string[]; visits: number }>(apiRoute(`/page-visits/${encodedIp}`))
  if (!pageVisits.data) throw new Error('Failed to get page visits')
  console.log(pageVisits.data)
  return pageVisits.data
}

export function PageVisits(): React.JSX.Element | null {
  const ipQuery = useQuery({ queryKey: ['pageVisits'], queryFn: getVisits, initialData: { visitorIps: [], visits: 0 } })
  if (ipQuery.isError || !ipQuery.data) return null
  if (ipQuery.isFetching) return null
  return (
    <div className='fixed bottom-0 items-center justify-center gap-4'>
      <div className='text-center text-[0.5rem] sm:text-[0.6rem] md:text-[0.7rem] lg:text-[0.8rem]'>{`This page has been loaded ${ipQuery.data.visits} time(s) by ${ipQuery.data.visitorIps.length} visitor(s)}`}</div>
    </div>
  )
}
