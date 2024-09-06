import type { Metadata } from 'next'
import '@/styles/globals.css'
import fonts from '@/lib/fonts'

export const metadata: Metadata = {
  title: 'gloved.dev',
  description: 'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.',
  icons: [{ rel: 'icon', url: 'https://avatars.githubusercontent.com/u/96776176?v=4' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${fonts.geistSans.variable} ${fonts.geistMono.variable} ${fonts.JetBrainsMono.variable}`}>
      <body className='font-primary antialiased'>{children}</body>
    </html>
  )
}
