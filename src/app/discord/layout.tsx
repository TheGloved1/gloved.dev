import { NAME } from '@/lib/constants'
import '@/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: NAME + ' | Discord',
  description: 'Join my Discord to chat!',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
