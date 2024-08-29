/** @format */

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '@/styles/globals.css'
import { NAME } from '@/lib/constants'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: NAME,
  description: 'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.',
  icons: [{ rel: 'icon', url: 'https://avatars.githubusercontent.com/u/96776176?v=4' }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-mono">{children}</body>
    </html>
  )
}
