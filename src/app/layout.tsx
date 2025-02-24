import Providers from '@/components/Providers'
import { Toaster } from '@/components/ui/sonner'
import * as constants from '@/lib/constants'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Metadata } from 'next'
import { ViewTransitions } from 'next-view-transitions'
import { JetBrains_Mono } from 'next/font/google'
import React, { Suspense } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: constants.NAME,
  description:
    'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.',
  icons: 'https://avatars.githubusercontent.com/u/96776176?v=4',
}

const jetbrains = JetBrains_Mono({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
})

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransitions>
      <html lang='en'>
        <body
          className={`dark snap-x snap-mandatory antialiased bg-background ${jetbrains.className}`}
        >
          <Toaster toastOptions={{ style: { background: 'gray' } }} />
          <Providers>
            <Analytics />
            <SpeedInsights />
            <Suspense fallback={null}>{/* <RainingLetters /> */}</Suspense>
            {children}
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  )
}
