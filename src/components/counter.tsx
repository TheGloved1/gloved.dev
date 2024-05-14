'use client'

import { useState } from 'react'
import { Button } from 'src/components/ui/button';

export default function Counter() {
  console.log('Rendering Counter...');
  const [count, setCount] = useState(0)

  return (
    <div>
      <Button onClick={() => setCount(count + 1)}>Clicks: {count}</Button>
    </div>
  )
}
