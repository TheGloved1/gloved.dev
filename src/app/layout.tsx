import React from 'react'
import { Metadata } from 'next'
import './globals.css'
import ReactQueryClientProvider from '@/components/ReactQueryClientProvider'

export const metadata: Metadata = {
  title: 'gloved.dev',
  description:
    'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.',
  icons: [{ rel: 'icon', url: 'https://avatars.githubusercontent.com/u/96776176?v=4' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-jetbrains antialiased`}>
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </body>
    </html>
  )
}
