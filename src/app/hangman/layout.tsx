import { NAME } from '@/lib/constants'
import '@/styles/globals.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: NAME + ' | Hangman Game',
  description: 'A simple hangman game web app. Guess the word. (Might be broken)',
}

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  )
}
