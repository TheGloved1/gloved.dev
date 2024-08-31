import { NAME } from '@/lib/constants'
import '@/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: NAME + ' | Todo App',
  description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading.',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang='en'>
      <body className={`h-dvh w-dvw bg-[#333] font-sans`}>{children}</body>
    </html>
  )
}
