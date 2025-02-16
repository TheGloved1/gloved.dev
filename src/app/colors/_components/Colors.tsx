'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { useEffect, useRef, useState } from 'react'

const initialColorClasses = [
  '#FF6900',
  '#FCB900',
  '#7BDCD2',
  '#039BE5',
  '#FF9770',
  '#FFC107',
  '#8BC34A',
  '#9C27B0',
]

const advancedColorClasses = [
  '#E040FB',
  '#00B8D9',
  '#0288D1',
  '#0097A7',
  '#43A047',
  '#E91E63',
  '#FF5252',
  '#66BB6A',
  '#795548',
  '#03A9F4',
  '#FFA07A',
  '#FFD700',
  '#DC143C',
  '#00FF7F',
  '#32CD32',
  '#6495ED',
]

function getRandomColor(availableColors: string[]): string {
  const randomIndex = Math.floor(Math.random() * availableColors.length)
  return availableColors[randomIndex]
}

function addColors(color1: string, color2: string): string {
  const ratio = 0.5
  const r1 = Number.parseInt(color1.slice(1, 3), 16)
  const g1 = Number.parseInt(color1.slice(3, 5), 16)
  const b1 = Number.parseInt(color1.slice(5, 7), 16)

  const r2 = Number.parseInt(color2.slice(1, 3), 16)
  const g2 = Number.parseInt(color2.slice(3, 5), 16)
  const b2 = Number.parseInt(color2.slice(5, 7), 16)

  const r = Math.round(r1 * (1 - ratio) + r2 * ratio)
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio)
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio)

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

interface ColorButton {
  color: string
  level: number
  progress: number
}

export default function ColorEvolutionGame(): React.JSX.Element {
  const [colorButtons, setColorButtons] = useState<ColorButton[]>([
    { color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
    { color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
    { color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
    { color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
  ])
  const [score, setScore] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [prestigeLevel, setPrestigeLevel] = useState(0)
  const [prestigePoints, setPrestigePoints] = useState(0)
  const [clickCooldown, setClickCooldown] = useState(false)
  const [availableColors, setAvailableColors] = useState(initialColorClasses)
  const lastClickTime = useRef(Date.now())
  const clickCount = useRef(0)

  const checkAntiCheat = () => {
    const now = Date.now()
    if (now - lastClickTime.current < 50) {
      clickCount.current++
      if (clickCount.current > 10) {
        setClickCooldown(true)
        toast({
          duration: 5000,
          title: 'Slow down!',
          description: "You're clicking too fast. Please wait a moment.",
          variant: 'destructive',
        })
        setTimeout(() => setClickCooldown(false), 5000)
        return false
      }
    } else {
      clickCount.current = 0
    }
    lastClickTime.current = now
    return !clickCooldown
  }

  const handleColorClick = (index: number) => {
    if (!checkAntiCheat()) return

    setColorButtons((prevButtons) => {
      const newButtons = [...prevButtons]
      newButtons[index].progress += 10 * multiplier * (1 + prestigeLevel * 0.1)
      if (newButtons[index].progress >= 100) {
        newButtons[index].progress = 0
        newButtons[index].level += 1
        newButtons[index].color = getRandomColor(availableColors)

        // Score is only gained when leveling up
        const pointsEarned = newButtons[index].level * 10 * (1 + prestigeLevel * 0.2)
        setScore((prevScore) => prevScore + pointsEarned)
        setPrestigePoints((prevPoints) => prevPoints + pointsEarned * 0.01)

        toast({
          duration: 3000,
          title: 'Level Up!',
          description: `Color leveled up to ${newButtons[index].level}! Earned ${Math.floor(pointsEarned)} points.`,
        })

        // Unlock new colors based on level
        if (
          newButtons[index].level % 5 === 0 &&
          availableColors.length < initialColorClasses.length + advancedColorClasses.length
        ) {
          const newColorIndex = availableColors.length - initialColorClasses.length
          if (newColorIndex < advancedColorClasses.length) {
            setAvailableColors((prev) => [...prev, advancedColorClasses[newColorIndex]])

            // Bonus score for unlocking a new color
            const unlockBonus = 1000 * (1 + prestigeLevel * 0.5)
            setScore((prevScore) => prevScore + unlockBonus)
            setPrestigePoints((prevPoints) => prevPoints + unlockBonus * 0.01)

            toast({
              duration: 5000,
              title: 'New Color Unlocked!',
              description: `You've unlocked a new color at level ${newButtons[index].level}! Bonus: ${Math.floor(unlockBonus)} points!`,
            })
          }
        }
      }
      return newButtons
    })
  }

  const combineColors = (index1: number, index2: number) => {
    if (index1 === index2 || !checkAntiCheat()) return

    setColorButtons((prevButtons) => {
      const newButtons = [...prevButtons]
      const combinedColor = addColors(newButtons[index1].color, newButtons[index2].color)
      const combinedLevel =
        Math.floor((newButtons[index1].level + newButtons[index2].level) / 2) + 1

      newButtons[index1] = {
        color: combinedColor,
        level: combinedLevel,
        progress: 0,
      }

      newButtons[index2] = {
        color: getRandomColor(availableColors),
        level: 1,
        progress: 0,
      }

      // Combining colors now only boosts progress of other buttons
      newButtons.forEach((button, idx) => {
        if (idx !== index1 && idx !== index2) {
          button.progress += 20 * (1 + prestigeLevel * 0.1)
        }
      })
      toast({
        duration: 3000,
        title: 'Combination Boost!',
        description: 'Other colors received a progress boost!',
      })

      return newButtons
    })
  }

  const upgradeMultiplier = () => {
    if (!checkAntiCheat()) return

    setMultiplier((prev) => Math.min(prev + 1, 5 + prestigeLevel))
  }

  const prestige = () => {
    if (!checkAntiCheat()) return

    if (score < 10000 * (prestigeLevel + 1)) {
      toast({
        duration: 5000,
        title: 'Not enough score',
        description: `You need ${10000 * (prestigeLevel + 1)} points to prestige.`,
        variant: 'destructive',
      })
      return
    }

    setPrestigeLevel((prev) => prev + 1)
    setScore(0)
    setMultiplier(1)
    setColorButtons([
      { color: getRandomColor(availableColors), level: 1, progress: 0 },
      { color: getRandomColor(availableColors), level: 1, progress: 0 },
      { color: getRandomColor(availableColors), level: 1, progress: 0 },
      { color: getRandomColor(availableColors), level: 1, progress: 0 },
    ])
    toast({
      duration: 5000,
      title: 'Prestige!',
      description: `You've reached prestige level ${prestigeLevel + 1}!`,
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setColorButtons((prevButtons) => {
        return prevButtons.map((button) => ({
          ...button,
          progress: Math.min(button.progress + (1 + prestigeLevel * 0.1), 100),
        }))
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [prestigeLevel])

  return (
    <div className='flex h-dvh select-none w-dvw flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-gray-800'>
      <h1 className='text-4xl font-bold mb-4'>{'Stupid Color Game (WIP)'}</h1>
      <div className='text-2xl mb-4'>Score: {Math.floor(score)}</div>
      <div className='text-xl mb-4'>Prestige Level: {prestigeLevel}</div>
      <div className='text-xl mb-4'>Prestige Points: {Math.floor(prestigePoints)}</div>
      <div className='text-lg mb-4'>Available Colors: {availableColors.length}</div>
      <div className='grid grid-cols-2 gap-4'>
        {colorButtons.map((button, index) => (
          <div key={index} className='flex flex-col items-center'>
            <Button
              onClick={() => handleColorClick(index)}
              className='w-24 h-24 rounded-full'
              style={{ backgroundColor: button.color }}
              disabled={clickCooldown}
            >
              Level {button.level}
            </Button>
            <Progress value={button.progress} className='w-24 mt-2' />
          </div>
        ))}
      </div>
      <div className='mt-4'>
        <Button onClick={() => combineColors(0, 1)} className='mr-2' disabled={clickCooldown}>
          Combine 1 & 2
        </Button>
        <Button onClick={() => combineColors(2, 3)} disabled={clickCooldown}>
          Combine 3 & 4
        </Button>
      </div>
      <div className='mt-4'>
        <Button
          onClick={() => upgradeMultiplier()}
          disabled={multiplier >= 5 + prestigeLevel || clickCooldown}
        >
          Upgrade Multiplier (Current: {multiplier}x)
        </Button>
      </div>
      <div className='mt-4'>
        <Button onClick={prestige} variant='outline' disabled={clickCooldown}>
          Prestige (Requires {10000 * (prestigeLevel + 1)} points)
        </Button>
      </div>
      <Toaster />
    </div>
  )
}
