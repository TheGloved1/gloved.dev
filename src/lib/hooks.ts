'use client'
import axios from 'axios'
import { safeAwait } from './utils'
import { useEffect, useState } from 'react'

export function useFetchIp() {
  const [clientIp, setClientIp] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIp = async () => {
      const [response, error] = await safeAwait(axios.get('https://api64.ipify.org?format=json'))
      if (error) {
        console.error('Failed to fetch client IP:', error)
        return
      }
      setClientIp(response.data.ip)
      console.log('Client IP:', response.data.ip)
      setLoading(false)
    }

    fetchIp()
  })

  return { clientIp, loading }
}
