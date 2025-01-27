import React from 'react'
import { Metadata } from 'next'
import './globals.css'
import ReactQueryClientProvider from '@/components/ReactQueryClientProvider'
import { NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: NAME,
  description:
    'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.',
  icons: 'https://avatars.githubusercontent.com/u/96776176?v=4',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`snap-x snap-mandatory font-jetbrains antialiased`}>
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </body>
    </html>
  )
}
