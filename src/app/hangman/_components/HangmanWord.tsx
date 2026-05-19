'use client';

type HangmanWordProps = {
  guessedLetters: string[];
  wordToGuess: string;
  reveal?: boolean;
};

export function HangmanWord({ guessedLetters, wordToGuess, reveal = false }: HangmanWordProps) {
  return (
    <div className='flex max-w-full gap-0.5 overflow-x-auto sm:gap-1 md:gap-1.5 lg:gap-2'>
      {wordToGuess.split('').map((letter, index) => {
        const isGuessed = guessedLetters.includes(letter);
        const showLetter = isGuessed || reveal;
        return (
          <div
            key={index}
            className='flex h-9 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 sm:h-10 sm:w-8 sm:rounded-xl md:h-12 md:w-9 lg:h-14 lg:w-10 xl:h-16 xl:w-11'
          >
            <span
              className={`font-display text-xs font-bold uppercase tracking-tight transition-all duration-300 sm:text-sm md:text-base lg:text-lg xl:text-2xl ${
                showLetter ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              } ${reveal && !isGuessed ? 'text-red-400' : 'text-fuchsia-400'}`}
            >
              {showLetter ? letter : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}
