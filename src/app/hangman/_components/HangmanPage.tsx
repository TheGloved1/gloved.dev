'use client';

import { Button } from '@/components/ui/button';
import useIsDev from '@/hooks/use-is-dev';
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

  const isDev = useIsDev();

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

        <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
        <HangmanWord reveal={isLoser} guessedLetters={guessedLetters} wordToGuess={wordToGuess} />

        <Keyboard
          disabled={isWinner || isLoser}
          activeLetters={guessedLetters.filter((letter) => wordToGuess.includes(letter))}
          inactiveLetters={incorrectLetters}
          addGuessedLetter={addGuessedLetter}
        />

        {isDev && (
          <div className='flex gap-2'>
            <button
              onClick={() => {
                const letters = [...new Set(wordToGuess.split(''))];
                setGuessedLetters(letters);
              }}
              className='brutal-shadow-sm font-mono-industrial rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 transition-all duration-150 hover:bg-emerald-500/20 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
            >
              Auto Win
            </button>
            <button
              onClick={() => {
                const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
                const wrong = alphabet.filter((l) => !wordToGuess.includes(l)).slice(0, 6);
                setGuessedLetters(wrong);
              }}
              className='brutal-shadow-sm font-mono-industrial rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-400 transition-all duration-150 hover:bg-red-500/20 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
            >
              Auto Lose
            </button>
          </div>
        )}

        {isGameOver && (
          <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm duration-300 animate-in fade-in'>
            <div className='mx-4 w-full max-w-sm rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-8 text-center shadow-[0_0_40px_rgba(236,72,153,0.15)] backdrop-blur-md duration-300 animate-in fade-in zoom-in'>
              <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10'>
                <Skull className='h-7 w-7 text-fuchsia-500' />
              </div>
              {isWinner ?
                <p className='font-display mb-2 text-3xl font-bold uppercase tracking-tight text-fuchsia-400'>You Win!</p>
              : <p className='font-display mb-2 text-3xl font-bold uppercase tracking-tight text-red-400'>Game Over</p>}
              <p className='font-mono-industrial mb-1 text-xs text-white/50'>
                The word was <span className='font-bold uppercase text-white/80'>{wordToGuess}</span>
              </p>
              {isWinner && (
                <p className='font-mono-industrial mb-8 text-[10px] text-white/40'>
                  {incorrectLetters.length} incorrect
                  {incorrectLetters.length === 1 ? ' guess' : ' guesses'}
                  {' · '}
                  {6 - incorrectLetters.length} try
                  {6 - incorrectLetters.length === 1 ? '' : 's'} remaining
                </p>
              )}
              {isLoser && <div className='mb-8' />}
              <button
                onClick={newGame}
                className='brutal-shadow font-mono-industrial w-full border border-fuchsia-500 bg-fuchsia-500 px-8 py-3 text-sm font-bold uppercase tracking-wider text-black transition-all duration-150 hover:bg-fuchsia-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
