import React, { useCallback, useEffect, useMemo, useState } from 'react'

const Timestamp = React.memo(({ date }: { date: Date }) => {
  const [timestamp, setTimestamp] = useState(createTimestamp(date))
  const [interval, setIntervalState] = useState(calculateInterval(date))

  const updateTimestamp = useCallback(() => {
    setTimestamp(createTimestamp(date))
  }, [date])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (interval !== null) {
      intervalId = setInterval(updateTimestamp, interval)
    }
    return () => clearInterval(intervalId)
  }, [interval, updateTimestamp])

  //Memoize to avoid unnecessary recalculation
  const memoizedInterval = useMemo(() => calculateInterval(date), [date])
  useEffect(() => {
    setIntervalState(memoizedInterval)
  }, [memoizedInterval])

  return <span>{timestamp}</span>
})
Timestamp.displayName = 'Timestamp'

const calculateInterval = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 86400) {
    // Less than a day old
    if (seconds < 60) return 1000 // 1 second
    if (seconds < 3600) return 60000 // 1 minute
    if (seconds < 86400) return 3600000 // 1 hour
  } else {
    return null // Deactivate interval if over a day old.
  }
}

const createTimestamp = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = Math.floor(seconds / 31536000)

  if (interval >= 1) {
    return `Sent ${interval} year${interval === 1 ? '' : 's'} ago`
  }
  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return `Sent ${interval} month${interval === 1 ? '' : 's'} ago`
  }
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return `Sent ${interval} day${interval === 1 ? '' : 's'} ago`
  }
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return `Sent ${interval} hour${interval === 1 ? '' : 's'} ago`
  }
  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return `Sent ${interval} minute${interval === 1 ? '' : 's'} ago`
  }
  return `Sent ${seconds} second${seconds === 1 ? '' : 's'} ago`
}

export default Timestamp
