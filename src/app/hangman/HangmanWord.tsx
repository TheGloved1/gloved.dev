type HangmanWordProps = {
  guessedLetters: string[]
  wordToGuess: string
  reveal?: boolean
}

export function HangmanWord({ guessedLetters, wordToGuess, reveal = false }: HangmanWordProps) {
  return (
    <div className='flex gap-[0.25em] font-mono text-[6rem] font-bold uppercase'>
      {wordToGuess.split('').map((letter, index) => (
        <span style={{ borderBottom: '.5rem solid black' }} key={index}>
          <span
            key={index}
            className={`${
              guessedLetters.includes(letter) || reveal ? 'visible' : 'invisible'
            } ${!guessedLetters.includes(letter) && reveal ? 'text-red-500' : 'text-black'}`}
          >
            {letter}
          </span>
        </span>
      ))}
    </div>
  )
}
