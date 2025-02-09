import ReactQueryClientProvider from '@/components/ReactQueryClientProvider'
import * as constants from '@/lib/constants'
import { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import React from 'react'
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
    <html lang='en'>
      <body className={`snap-x snap-mandatory antialiased bg-gray-900 ${jetbrains.className}`}>
        <ReactQueryClientProvider>{children}</ReactQueryClientProvider>
      </body>
    </html>
  )
}
