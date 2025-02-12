'use client'

import { checkDevMode } from '@/lib/actions'
import { useQuery } from '@tanstack/react-query'
import type React from 'react'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

interface Character {
  char: string
  x: number
  y: number
  speed: number
}

interface RainingLettersProps {
  children?: ReactNode
  characterCount?: number
  characterSet?: string
  backgroundColor?: string
  characterColor?: string
  activeCharacterColor?: string
}

class TextScramble {
  el: HTMLElement
  chars: string
  queue: Array<{
    from: string
    to: string
    start: number
    end: number
    char?: string
  }>
  frame: number
  frameRequest: number
  resolve: (value: void | PromiseLike<void>) => void

  constructor(el: HTMLElement) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#'
    this.queue = []
    this.frame = 0
    this.frameRequest = 0
    this.resolve = () => {}
    this.update = this.update.bind(this)
  }

  setText(newText: string) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise<void>((resolve) => (this.resolve = resolve))
    this.queue = []

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }

    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }

  update() {
    let output = ''
    let complete = 0

    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          const char = this.chars[Math.floor(Math.random() * this.chars.length)]
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }

    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
}

const ScrambledTitle: React.FC = () => {
  const elementRef = useRef<HTMLHeadingElement>(null)
  const scramblerRef = useRef<TextScramble | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (elementRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(elementRef.current)
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (mounted && scramblerRef.current) {
      const phrases = ['Welcome!', "I'm Gloves", "I'm a Software Developer"]

      let counter = 0
      const next = () => {
        if (scramblerRef.current) {
          scramblerRef.current.setText(phrases[counter]).then(() => {
            setTimeout(next, 2000)
          })
          counter = (counter + 1) % phrases.length
        }
      }

      next()
    }
  }, [mounted])

  return (
    <h1
      ref={elementRef}
      className='text-white text-6xl font-bold tracking-wider justify-center'
      style={{ fontFamily: 'monospace' }}
    ></h1>
  )
}

const RainingLetters: React.FC<RainingLettersProps> = ({
  children,
  characterCount = 300,
  characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  backgroundColor = 'bg-black',
  characterColor = 'text-slate-600',
  activeCharacterColor = 'text-[#00ff00]',
}) => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [charCount, setCharCount] = useState<number>(characterCount)
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set())
  const isDev = useQuery({ queryKey: ['devMode'], queryFn: checkDevMode, initialData: false })

  const createCharacters = useCallback(() => {
    const newCharacters: Character[] = []

    for (let i = 0; i < charCount; i++) {
      newCharacters.push({
        char: characterSet[Math.floor(Math.random() * characterSet.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.3,
      })
    }

    return newCharacters
  }, [charCount, characterSet])

  useEffect(() => {
    setCharacters(createCharacters())
  }, [createCharacters])

  useEffect(() => {
    const updateActiveIndices = () => {
      const newActiveIndices = new Set<number>()
      const numActive = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < numActive; i++) {
        newActiveIndices.add(Math.floor(Math.random() * characters.length))
      }
      setActiveIndices(newActiveIndices)
    }

    const flickerInterval = setInterval(updateActiveIndices, 50)
    return () => clearInterval(flickerInterval)
  }, [characters.length])

  useEffect(() => {
    let animationFrameId: number

    const updatePositions = () => {
      setCharacters((prevChars) =>
        prevChars.map((char) => ({
          ...char,
          y: char.y + char.speed,
          ...(char.y >= 100 && {
            y: -5,
            x: Math.random() * 100,
            char: characterSet[Math.floor(Math.random() * characterSet.length)],
          }),
        })),
      )
      animationFrameId = requestAnimationFrame(updatePositions)
    }

    animationFrameId = requestAnimationFrame(updatePositions)
    return () => cancelAnimationFrame(animationFrameId)
  }, [characterSet])

  return (
    <div className={`relative w-full h-full ${backgroundColor}`}>
      {isDev && (
        <div className='p-4 fixed z-50 flex items-center flex-wrap max-w-72 top-1/2 right-0 transform -translate-y-1/2'>
          <h1 title='Character Count' className='text-sm text-white'>
            Character Count: {charCount}
          </h1>
          <input
            title='Character Count'
            className='input input-sm input-accent bg-background'
            type='number'
            value={charCount}
            onChange={(e) => setCharCount(parseInt(e.target.value))}
          />
        </div>
      )}
      {/* Raining Characters - Fixed Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none z-0'>
        {characters.map((char, index) => (
          <span
            key={index}
            className={`absolute text-xs transition-colors duration-100 ${
              activeIndices.has(index) ?
                `${activeCharacterColor} text-base scale-125 z-10 font-bold animate-pulse`
              : `${characterColor} font-light`
            }`}
            style={{
              left: `${char.x}%`,
              top: `${char.y}%`,
              transform: `translate(-50%, -50%) ${activeIndices.has(index) ? 'scale(1.25)' : 'scale(1)'}`,
              textShadow:
                activeIndices.has(index) ? '0 0 8px rgba(255,255,255,0.8), 0 0 12px rgba(255,255,255,0.4)' : 'none',
              opacity: activeIndices.has(index) ? 1 : 0.4,
              transition: 'color 0.1s, transform 0.1s, text-shadow 0.1s',
              willChange: 'transform, top',
              fontSize: '1.8rem',
            }}
          >
            {char.char}
          </span>
        ))}
      </div>

      {/* Page Content - Positioned Above Background */}
      <div className='relative z-10'>{children}</div>

      <style jsx global>{`
        .dud {
          color: #0f0;
          opacity: 0.7;
        }
      `}</style>
    </div>
  )
}

export default RainingLetters
