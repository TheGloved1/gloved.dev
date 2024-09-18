import { Hangman, NAME } from '@/lib/constants'
import '@/tailwind.css'
import { MetaFunction } from '@remix-run/react'
import HangmanPage from './hangman/HangmanPage'

export const meta: MetaFunction = () => {
  return [{ title: NAME + ' | ' + Hangman.title }, { name: 'description', content: Hangman.description }]
}

export default function Page(): React.JSX.Element {
  return <HangmanPage />
}
