import { Hangman, NAME } from '@/lib/constants'
import { Metadata } from 'next'
import HangmanPage from './HangmanPage'

export const metadata: Metadata = {
  title: NAME + ' | ' + Hangman.title,
  description: Hangman.description,
}

export default function Page(): React.JSX.Element {
  return <HangmanPage />
}
