import { NAME } from '@/lib/constants'
import '@/tailwind.css'
import { MetaFunction } from '@remix-run/react';
import HangmanPage from './hangman/HangmanPage';

export const meta: MetaFunction = () => {
  return [
    { title: NAME + ' | Hangman Game', },
    { name: "description", content: 'A simple hangman game web app. Guess the word. (Might be broken)' },
  ];
};

export default function Page({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <HangmanPage />
  )
}
