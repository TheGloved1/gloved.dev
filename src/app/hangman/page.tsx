'use client'
import ChevronLeft from '@/components/chevron-left'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { HangmanDrawing } from './_components/HangmanDrawing'
import { HangmanWord } from './_components/HangmanWord'
import { Keyboard } from './_components/Keyboard'
import words from './wordList.json'
import React from 'react'

function getWord() {
  return words[Math.floor(Math.random() * words.length)]!
}

export default function Page(): React.JSX.Element {
  const [wordToGuess, setWordToGuess] = useState(getWord)
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])

  const incorrectLetters = guessedLetters.filter((letter) => !wordToGuess.includes(letter))

  const isLoser = incorrectLetters.length >= 6
  const isWinner = wordToGuess.split('').every((letter) => guessedLetters.includes(letter))

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return

      setGuessedLetters((currentLetters) => [...currentLetters, letter])
    },
    [guessedLetters, isWinner, isLoser]
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key
      if (!key.match(/^[a-z]$/)) return

      e.preventDefault()
      addGuessedLetter(key)
    }

    document.addEventListener('keypress', handler)

    return () => {
      document.removeEventListener('keypress', handler)
    }
  }, [addGuessedLetter])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key
      if (key !== 'Enter') return

      e.preventDefault()
      setGuessedLetters([])
      setWordToGuess(getWord())
    }

    document.addEventListener('keypress', handler)

    return () => {
      document.removeEventListener('keypress', handler)
    }
  }, [])

  return (
    <>
      <main className='flex max-h-screen min-h-screen items-center justify-center bg-gradient-to-br from-sky-950 to-[#1e210c] text-white'>
        <Link href={'/'} className='fixed left-2 top-2 flex flex-row items-center justify-center pl-0'>
          <button className='btn flex flex-row items-center justify-center'>
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <div className='flex max-w-4xl flex-col items-center gap-8'>
          <div className='items-center text-[2rem]'>
            {isWinner && 'Winner! - Refresh to try again'}
            {isLoser && 'Nice Try - Refresh to try again'}
          </div>
          <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
          <HangmanWord reveal={isLoser} guessedLetters={guessedLetters} wordToGuess={wordToGuess} />
          <div className='min-w-46 self-stretch'>
            <Keyboard
              disabled={isWinner || isLoser}
              activeLetters={guessedLetters.filter((letter) => wordToGuess.includes(letter))}
              inactiveLetters={incorrectLetters}
              addGuessedLetter={addGuessedLetter}
            />
          </div>
        </div>
      </main>
    </>
  )
}
