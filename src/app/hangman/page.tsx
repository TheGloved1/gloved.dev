"use client"
import { useCallback, useEffect, useState } from "react"
import { HangmanDrawing } from "./_components/HangmanDrawing"
import { HangmanWord } from "./_components/HangmanWord"
import { Keyboard } from "./_components/Keyboard"
import words from "./wordList.json"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

function getWord() {
  return words[Math.floor(Math.random() * words.length)]!
}

export default function Page() {
  const [wordToGuess, setWordToGuess] = useState(getWord)
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])

  const incorrectLetters = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  )

  const isLoser = incorrectLetters.length >= 6
  const isWinner = wordToGuess
    .split("")
    .every(letter => guessedLetters.includes(letter))

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return

      setGuessedLetters(currentLetters => [...currentLetters, letter])
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

    document.addEventListener("keypress", handler)

    return () => {
      document.removeEventListener("keypress", handler)
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key
      if (key !== "Enter") return

      e.preventDefault()
      setGuessedLetters([])
      setWordToGuess(getWord())
    }

    document.addEventListener("keypress", handler)

    return () => {
      document.removeEventListener("keypress", handler)
    }
  }, [])

  return (
    <>
      <main className="justify-center items-center text-white">
        <Link href={"/"} className="flex fixed top-2 left-2 flex-row justify-center items-center pl-0">
          <button className="flex flex-row justify-center items-center btn">
            <ChevronLeft />
            {"Back"}
          </button>
        </Link>
        <div className="flex flex-col gap-8 items-center mx-auto max-w-4xl max-h-svh">
          <div className="items-center text-[2rem]">
            {isWinner && "Winner! - Refresh to try again"}
            {isLoser && "Nice Try - Refresh to try again"}
          </div>
          <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
          <HangmanWord
            reveal={isLoser}
            guessedLetters={guessedLetters}
            wordToGuess={wordToGuess}
          />
          <div className="self-stretch">
            <Keyboard
              disabled={isWinner || isLoser}
              activeLetters={guessedLetters.filter(letter =>
                wordToGuess.includes(letter)
              )}
              inactiveLetters={incorrectLetters}
              addGuessedLetter={addGuessedLetter}
            />
          </div>
        </div>
      </main>
    </>
  )
}
