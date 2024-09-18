import React from 'react'

export default function Counter() {
  const [count, setCount] = React.useState(0)

  return (
    <div className='justify-center text-center'>
      <h1>Test React State Button</h1>
      <button className='btn btn-primary m-4 h-12 w-32 p-4 active:btn-active hover:bg-pink-500 active:bg-pink-700' onClick={() => setCount((c) => c + 1)}>
        Count is {count}
      </button>
      <button className='btn btn-primary m-4 h-12 w-32 p-4 active:btn-active hover:bg-pink-500 active:bg-pink-700' onClick={() => setCount(0)}>
        Reset Count
      </button>
    </div>
  )
}
