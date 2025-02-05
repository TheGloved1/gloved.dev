import styles from './Keyboard.module.css'

const KEYS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]

export function Keyboard({
  activeLetters,
  inactiveLetters,
  addGuessedLetter,
  disabled = false,
}: {
  disabled?: boolean
  activeLetters: string[]
  inactiveLetters: string[]
  addGuessedLetter: (letter: string) => void
}) {
  return (
    <div className='grid max-w-4xl grid-cols-[repeat(auto-fit,minmax(75px,1fr))] gap-1 text-xs'>
      {KEYS.map((key) => {
        const isActive = activeLetters.includes(key)
        const isInactive = inactiveLetters.includes(key)
        return (
          <button
            onClick={() => addGuessedLetter(key)}
            className={`${styles.btn} ${isActive ? styles.active : ''} ${isInactive ? styles.inactive : ''}`}
            disabled={isInactive || isActive || disabled}
            key={key}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}
