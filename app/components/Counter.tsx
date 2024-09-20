import React, { useState } from 'react'

export default function Counter(): React.JSX.Element {
  const [count, setCount] = useState(0)

  return (
    <div className='justify-center text-center'>
      <h1>Test React State Buttons</h1>
      <h2>Count: {count}</h2>
      <button className='btn btn-primary m-4 h-12 w-32 p-2 active:btn-active hover:bg-pink-500 active:bg-pink-700' onClick={() => setCount((c) => c + 1)}>
        Increase Count
      </button>
      <button className='btn btn-primary m-4 h-12 w-32 p-2 active:btn-active hover:bg-pink-500 active:bg-pink-700' onClick={() => setCount((c) => c - 1)}>
        Decrease Count
      </button>
      <button className='btn btn-primary m-4 h-12 w-32 p-2 active:btn-active hover:bg-pink-500 active:bg-pink-700' onClick={() => setCount(0)}>
        Reset Count
      </button>
    </div>
  )
}
