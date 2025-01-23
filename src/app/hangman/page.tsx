import { Hangman, NAME } from '@/lib/constants'
import HangmanPage from './HangmanPage'
import { Metadata } from 'next'

export const meta: Metadata = {
  title: NAME + ' | ' + Hangman.title,
  description: Hangman.description,
}

export default function Page(): React.JSX.Element {
  return <HangmanPage />
}
