'use client';

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
];

const btnBase =
  'flex items-center justify-center rounded-lg border font-mono-industrial font-semibold uppercase transition-all duration-150 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:pointer-events-none h-9 w-8 text-xs min-w-[44px] min-h-[44px] sm:h-10 sm:w-9 sm:rounded-xl sm:text-sm md:h-11 md:w-10';

export function Keyboard({
  activeLetters,
  inactiveLetters,
  addGuessedLetter,
  disabled = false,
}: {
  disabled?: boolean;
  activeLetters: string[];
  inactiveLetters: string[];
  addGuessedLetter: (letter: string) => void;
}) {
  return (
    <div className='flex w-full max-w-sm flex-wrap justify-center gap-1 sm:max-w-md md:max-w-lg md:gap-1.5'>
      {KEYS.map((key) => {
        const isActive = activeLetters.includes(key);
        const isInactive = inactiveLetters.includes(key);
        return (
          <button
            onClick={() => addGuessedLetter(key)}
            disabled={isInactive || isActive || disabled}
            key={key}
            className={`${btnBase} ${
              isActive ? 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400'
              : isInactive ? 'border-white/5 bg-white/[0.02] text-white/20'
              : 'brutal-shadow-sm border-white/10 bg-white/5 text-white hover:border-fuchsia-500/40 hover:bg-fuchsia-500/[0.06]'
            }`}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}
