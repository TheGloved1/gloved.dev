'use client'
import { checkDevMode } from '@/lib/actions'
import { useQuery } from '@tanstack/react-query'
import React, { useCallback, useEffect, useState } from 'react'

interface Character {
  char: string
  x: number
  y: number
  speed: number
}

interface RainingLettersProps {
  children?: React.ReactNode
  characterCount?: number
  characterSet?: string
  backgroundColor?: string
  characterColor?: string
  activeCharacterColor?: string
}

export default function RainingLetters({
  children,
  characterCount = 300,
  characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?',
  backgroundColor = 'bg-black',
  characterColor = 'text-slate-600',
  activeCharacterColor = 'text-[#00ff00]',
}: RainingLettersProps): React.JSX.Element {
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
    </div>
  )
}
