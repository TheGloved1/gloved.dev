import React, { useState, useEffect, useRef } from 'react'

export default function Counter(): React.JSX.Element {
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleButtonClick = (newCount: number) => {
    if (timeoutRef.current) {
      setIsAnimating(false)
      clearTimeout(timeoutRef.current)
    }
    setCount(newCount)
    setIsAnimating(true)
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      setIsAnimating(false)
    }, 100)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        setIsAnimating(false)
      }
    }
  }, [])

  return (
    <div className='justify-center text-center'>
      <h1>Test React State Buttons</h1>
      <h2 className={isAnimating ? 'animate-ping' : ''}>Count: {count}</h2>
      <div className='flex'>
        <button
          className='btn btn-primary m-4 grid h-12 w-32 grid-cols-2 p-2 active:btn-active hover:bg-pink-500 active:bg-pink-700'
          onClick={() => handleButtonClick(count + 1)}
        >
          <div>Increase Count</div>
          <span className='text-xs'>+</span>
        </button>
        <button
          className='btn btn-primary m-4 grid h-12 w-32 grid-cols-2 p-2 active:btn-active hover:bg-pink-500 active:bg-pink-700'
          onClick={() => handleButtonClick(count - 1)}
        >
          <div>Decrease Count</div>
          <span className='text-xs'>-</span>
        </button>
        <button className='btn btn-primary m-4 h-12 w-32 p-2 active:btn-active hover:bg-pink-500 active:bg-pink-700' onClick={() => handleButtonClick(0)}>
          <div>Reset Count</div>
        </button>
      </div>
    </div>
  )
}
