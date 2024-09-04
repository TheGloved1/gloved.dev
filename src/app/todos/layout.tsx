import { geistSans, geistMono } from '@/lib/fonts'
import '@/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'gloved.dev | Todo App',
  description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className='h-dvh w-dvw bg-[#333] font-mono'>{children}</body>
    </html>
  )
}
