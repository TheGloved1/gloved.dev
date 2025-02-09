'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useState } from 'react'

export default function ReactQueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: true,
            experimental_prefetchInRender: true,
          },
        },
      }),
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
