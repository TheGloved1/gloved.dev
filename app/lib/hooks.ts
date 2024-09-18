import React from 'react'
export function useQuery(url: string) {
  const [data, setData] = React.useState<JSON | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)
  React.useEffect(() => {
    let ignore = false
    const handleFetch = async () => {
      setData(null)
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(url)
        if (ignore) return
        if (!res.ok) {
          throw new Error(res.statusText)
        }
        const json = await res.json() as JSON
        setData(json)
        setIsLoading(false)
      } catch (e) {
        setError(e as Error)
        setIsLoading(false)
      }
    }
    handleFetch()
    return () => {
      ignore = true
    }
  }, [url])
  return { data, isLoading, error }
}
