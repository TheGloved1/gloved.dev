import '@/tailwind.css'
import { LinksFunction } from '@remix-run/node'
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/remix'
import React from 'react'

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: '/logo.png',
      type: 'image/png',
    },
  ]
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: false,
      refetchInterval: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
    },
  },
})

export function Layout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body className='font-jetbrains'>
        <Analytics />
        <SpeedInsights />
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools />
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App(): React.JSX.Element {
  return <Outlet />
}
