import axios from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useFetchIp() {
  const [clientIp, setClientIp] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json')
        setClientIp(response.data.ip)
      } catch (error) {
        console.error('Error fetching IP address:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIp()
  }, [])

  return { clientIp, loading }
}
