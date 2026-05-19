'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, Skull } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';
import { HangmanDrawing } from './HangmanDrawing';
import { HangmanWord } from './HangmanWord';
import { Keyboard } from './Keyboard';
import words from './wordList.json';

function getWord() {
  return words[Math.floor(Math.random() * words.length)]!;
}

export default function Page(): React.JSX.Element {
  const [wordToGuess, setWordToGuess] = useState(getWord);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);

  const incorrectLetters = guessedLetters.filter((letter) => !wordToGuess.includes(letter));
  const isLoser = incorrectLetters.length >= 6;
  const isWinner = wordToGuess.split('').every((letter) => guessedLetters.includes(letter));
  const isGameOver = isLoser || isWinner;

  const addGuessedLetter = useCallback(
    (letter: string) => {
      if (guessedLetters.includes(letter) || isLoser || isWinner) return;
      setGuessedLetters((currentLetters) => [...currentLetters, letter]);
    },
    [guessedLetters, isWinner, isLoser],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (!key.match(/^[a-z]$/)) return;
      e.preventDefault();
      addGuessedLetter(key);
    };
    document.addEventListener('keypress', handler);
    return () => document.removeEventListener('keypress', handler);
  }, [addGuessedLetter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key;
      if (key !== 'Enter') return;
      e.preventDefault();
      setGuessedLetters([]);
      setWordToGuess(getWord());
    };
    document.addEventListener('keypress', handler);
    return () => document.removeEventListener('keypress', handler);
  }, []);

  function newGame() {
    setGuessedLetters([]);
    setWordToGuess(getWord());
  }

  return (
    <div className='relative flex min-h-screen flex-col items-center bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <div className='grid-pattern pointer-events-none fixed inset-0' />
      <div className='noise-overlay' />

      <Link
        href={'/'}
        onClick={(e) => {
          e.preventDefault();
          if (window.history.length > 1) window.history.back();
          else window.location.href = '/';
        }}
        className='fixed left-3 top-3 z-50'
      >
        <Button className='brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs text-white hover:bg-fuchsia-500/20'>
          <ChevronLeft className='h-4 w-4' />
          <span className='hidden sm:block'>Back</span>
        </Button>
      </Link>

      <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-4 py-12 sm:gap-8 sm:py-16 lg:py-20'>
        <div className='flex items-center gap-2 sm:gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 sm:h-12 sm:w-12'>
            <Skull className='h-5 w-5 text-fuchsia-500 sm:h-6 sm:w-6' />
          </div>
          <div>
            <h1 className='font-display text-2xl font-bold uppercase tracking-tight text-white sm:text-3xl lg:text-4xl'>
              Hangman
            </h1>
            <p className='font-mono-industrial text-[10px] text-white/50 sm:text-sm'>
              Guess the word &mdash; one letter at a time
            </p>
          </div>
        </div>

        {isWinner && (
          <div className='rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-2 backdrop-blur-sm duration-300 animate-in fade-in zoom-in sm:px-6 sm:py-3'>
            <p className='font-display text-xl font-bold uppercase tracking-tight text-fuchsia-400 sm:text-2xl'>You Win!</p>
          </div>
        )}
        {isLoser && (
          <div className='rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 backdrop-blur-sm duration-300 animate-in fade-in zoom-in sm:px-6 sm:py-3'>
            <p className='font-display text-xl font-bold uppercase tracking-tight text-red-400 sm:text-2xl'>Game Over</p>
          </div>
        )}

        <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
        <HangmanWord reveal={isLoser} guessedLetters={guessedLetters} wordToGuess={wordToGuess} />

        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={guessedLetters.filter((letter) => wordToGuess.includes(letter))}
          inactiveLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
        />

        {isGameOver && (
          <button
            onClick={newGame}
            className='brutal-shadow font-mono-industrial border border-fuchsia-500 bg-fuchsia-500 px-6 py-2 text-xs font-bold uppercase tracking-wider text-black transition-all duration-150 hover:bg-fuchsia-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:px-8 sm:py-3 sm:text-sm'
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
