'use client'

import type React from 'react'

import PageBack from '@/components/PageBack'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToastProvider } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toaster'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { toast } from '@/hooks/use-toast'
import { Menu, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const colorProgression = [
  '#FF0000', // Red
  '#FF4D00', // Red-Orange
  '#FF7F00', // Orange
  '#FFA500', // Orange-Yellow
  '#FFFF00', // Yellow
  '#FFFF7F', // Yellow-Green
  '#00FF00', // Green
  '#00FF7F', // Green-Cyan
  '#00FFFF', // Cyan
  '#007FFF', // Blue-Cyan
  '#0000FF', // Blue
  '#4B0082', // Indigo
  '#8B00FF', // Violet
  '#C71585', // Magenta
  '#FF00FF', // Magenta
  '#FFC0CB', // Pink
  '#FFD700', // Yellow-Orange
  '#FFA07A', // DarkOrange
  '#FF4500', // DarkOrange-Red
  '#FF0000', // Red
  '#8F0000', // DarkRed
  '#4B0000', // DarkRed-Brown
  '#000000', // Black
  '#808080', // Gray
  '#C0C0C0', // LightGray
  '#FFFFFF', // White
]

interface ColorButton {
  id: number
  color: string
  level: number
  progress: number
  combinationBonus: number
}

interface Skill {
  id: number
  name: string
  level: number
  cost: number
}

export default function Colors(): React.JSX.Element {
  const [colorButtons, setColorButtons] = usePersistentState<ColorButton[]>(
    'colorButtons',
    [
      { id: 0, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
      { id: 1, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
      { id: 2, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
      { id: 3, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
    ],
    false,
  )
  const [score, setScore] = useState(0)
  const [prestigeLevel, setPrestigeLevel] = usePersistentState<number>('prestigeLevel', 0, false)
  const [prestigePoints, setPrestigePoints] = usePersistentState<number>('prestigePoints', 0, false)
  const [clickCooldown, setClickCooldown] = useState(false)
  const [availableColors, setAvailableColors] = usePersistentState<string[]>(
    'availableColors',
    [colorProgression[0]],
    false,
  )
  const lastClickTime = useRef(Date.now())
  const clickCount = useRef(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [combinationStreak, setCombinationStreak] = useState(0)

  const [skills, setSkills] = usePersistentState<Skill[]>(
    'skills',
    [
      { id: 0, name: 'Click Power', level: 1, cost: 10 },
      { id: 1, name: 'Auto Progress', level: 0, cost: 50 },
      { id: 2, name: 'Combo Boost', level: 0, cost: 100 },
      { id: 3, name: 'Color Mastery', level: 0, cost: 200 },
      { id: 4, name: 'Combination Expertise', level: 0, cost: 300 },
    ],
    false,
  )

  const effect = useCallback((skillId: number, level: number) => {
    const skillEffects = [
      { id: 0, effect: (level: number) => level * 0.2 },
      { id: 1, effect: (level: number) => level * 0.1 },
      { id: 2, effect: (level: number) => level * 0.3 },
      { id: 3, effect: (level: number) => level * 0.15 },
      { id: 4, effect: (level: number) => level * 0.25 },
    ]
    return skillEffects.find((skill) => skill.id === skillId)?.effect(level) ?? 0
  }, [])

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
        setTimeout(() => setClickCooldown(false), 2000)
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
      const clickPowerSkill = skills.find((skill) => skill.id === 0)
      const clickPowerBonus = effect(clickPowerSkill?.id ?? 0, clickPowerSkill?.level ?? 0)
      const combinationExpertiseSkill = skills.find((skill) => skill.id === 4)
      const combinationExpertiseBonus = effect(
        combinationExpertiseSkill?.id ?? 0,
        combinationExpertiseSkill?.level ?? 0,
      )

      const progressIncrease =
        10 *
        (1 + clickPowerBonus) *
        (1 + prestigeLevel * 0.1) *
        (1 + newButtons[index].combinationBonus * combinationExpertiseBonus)
      newButtons[index].progress += progressIncrease

      if (newButtons[index].progress >= 100) {
        newButtons[index].progress = 0
        newButtons[index].level += 1
        const nextColorIndex = Math.min(newButtons[index].level - 1, colorProgression.length - 1)
        newButtons[index].color = colorProgression[nextColorIndex]

        const colorMasterySkill = skills.find((skill) => skill.id === 3)
        const colorMasteryBonus = effect(colorMasterySkill?.id ?? 0, colorMasterySkill?.level ?? 0)
        const pointsEarned =
          newButtons[index].level * 10 * (1 + colorMasteryBonus) * (1 + prestigeLevel * 0.2)
        setScore((prevScore) => prevScore + pointsEarned)
        setPrestigePoints((prevPoints) => prevPoints + pointsEarned * 0.01)

        toast({
          duration: 3000,
          title: 'Level Up!',
          description: `Color leveled up to ${newButtons[index].level}! Earned ${Math.floor(pointsEarned)} points.`,
        })

        if (newButtons[index].level % 5 === 0 && availableColors.length < colorProgression.length) {
          const newColor = colorProgression[availableColors.length]
          setAvailableColors((prev) => [...prev, newColor])

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
      return newButtons
    })
  }

  const combineColors = (index1: number, index2: number) => {
    if (index1 === index2 || !checkAntiCheat()) return

    setColorButtons((prevButtons) => {
      const newButtons = [...prevButtons]
      const button1 = newButtons[index1]
      const button2 = newButtons[index2]
      const combinedLevel = Math.floor((button1.level + button2.level) / 2) + 1
      const combinedColorIndex = Math.min(combinedLevel - 1, colorProgression.length - 1)

      const comboBoostSkill = skills.find((skill) => skill.id === 2)
      const comboBoostBonus = effect(comboBoostSkill?.id ?? 0, comboBoostSkill?.level ?? 0)
      const combinationExpertiseSkill = skills.find((skill) => skill.id === 4)
      const combinationExpertiseBonus = effect(
        combinationExpertiseSkill?.id ?? 0,
        combinationExpertiseSkill?.level ?? 0,
      )

      newButtons[index1] = {
        ...button1,
        color: colorProgression[combinedColorIndex],
        level: combinedLevel,
        progress: 0,
        combinationBonus: button1.combinationBonus + 0.1,
      }

      newButtons[index2] = {
        ...button2,
        color: colorProgression[0],
        level: 1,
        progress: 0,
        combinationBonus: 0,
      }

      newButtons.forEach((button, idx) => {
        if (idx !== index1 && idx !== index2) {
          button.progress += 30 * (1 + comboBoostBonus) * (1 + prestigeLevel * 0.1)
        }
      })

      const combinationBonus =
        combinedLevel * 100 * (1 + prestigeLevel * 0.2) * (1 + combinationExpertiseBonus)
      setScore((prevScore) => prevScore + combinationBonus)
      setPrestigePoints((prevPoints) => prevPoints + combinationBonus * 0.02)

      setCombinationStreak((prev) => prev + 1)
      const streakBonus = Math.floor(combinationBonus * (combinationStreak * 0.1))
      setScore((prevScore) => prevScore + streakBonus)

      toast({
        duration: 3000,
        title: 'Combination Boost!',
        description: `Colors combined! Earned ${Math.floor(combinationBonus)} points, ${Math.floor(combinationBonus * 0.02)} PP, and ${streakBonus} streak bonus!`,
      })

      return newButtons
    })
  }

  const upgradeSkill = (skillIndex: number) => {
    if (!checkAntiCheat()) return

    setSkills((prevSkills) => {
      const newSkills = [...prevSkills]
      const skill = newSkills[skillIndex]
      if (prestigePoints >= skill.cost) {
        setPrestigePoints((prev) => prev - skill.cost)
        skill.level += 1
        skill.cost = Math.floor(skill.cost * 1.5)
        toast({
          duration: 3000,
          title: 'Skill Upgraded!',
          description: `${skill.name} is now level ${skill.level}!`,
        })
      } else {
        toast({
          duration: 3000,
          title: 'Not enough Prestige Points',
          description: `You need ${skill.cost} Prestige Points to upgrade this skill.`,
          variant: 'destructive',
        })
      }
      return newSkills
    })
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
    setColorButtons([
      { id: 0, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
      { id: 1, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
      { id: 2, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
      { id: 3, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
    ])
    setCombinationStreak(0)
    toast({
      duration: 5000,
      title: 'Prestige!',
      description: `You've reached prestige level ${prestigeLevel + 1}!`,
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setColorButtons((prevButtons) => {
        const autoProgressSkill = skills.find((skill) => skill.id === 1)
        const autoProgressBonus = effect(autoProgressSkill?.id ?? 0, autoProgressSkill?.level ?? 0)
        return prevButtons.map((button) => ({
          ...button,
          progress: Math.min(
            button.progress +
            (1 + autoProgressBonus) * (1 + prestigeLevel * 0.1) * (1 + button.combinationBonus),
            100,
          ),
        }))
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [skills, prestigeLevel, setColorButtons, effect])

  useEffect(() => {
    const isComplete = colorButtons.find((button) => button.progress >= 100)
    if (isComplete) {
      setColorButtons((prev) =>
        prev.map((button) =>
          button.progress >= 100 ?
            {
              ...button,
              progress: 0,
              level: button.level + 1,
              color: colorProgression[Math.min(button.level, colorProgression.length - 1)],
            }
            : button,
        ),
      )
    }
  }, [colorButtons, setColorButtons])

  return (
    <ToastProvider>
      <div className='flex h-dvh select-none w-dvw'>
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:relative md:translate-x-0`}
        >
          <Button
            className='md:hidden absolute top-4 right-4'
            variant='ghost'
            size='icon'
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className='h-4 w-4' />
          </Button>
          <h2 className='text-2xl font-bold mb-4 text-right'>Skills</h2>
          <ScrollArea className='h-[calc(100vh-5rem)]'>
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className='mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow'
              >
                <h3 className='text-lg font-semibold'>{skill.name}</h3>
                <p>Level: {skill.level}</p>
                <p>Effect: {(effect(index, skill.level) * 100).toFixed(1)}%</p>
                <p>Cost: {skill.cost} PP</p>
                <Button
                  onClick={() => upgradeSkill(index)}
                  className='mt-2'
                  disabled={prestigePoints < skill.cost}
                >
                  Upgrade
                </Button>
              </div>
            ))}
          </ScrollArea>
        </aside>

        <PageBack className='md:ml-64 z-50' />

        <main className='flex-1 p-8 overflow-y-auto'>
          <Button
            className='md:hidden mb-4'
            variant='outline'
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className='h-4 w-4 mr-2' />
            Open Skills
          </Button>
          <div className='flex flex-col items-center justify-center pt-36 gap-4'>
            <h1 className='text-4xl font-bold mb-4'>Stupid Color Game</h1>
            <div className='text-2xl mb-4'>Score: {Math.floor(score)}</div>
            <div className='text-xl mb-4'>Prestige Level: {prestigeLevel}</div>
            <div className='text-xl mb-4'>Prestige Points (PP): {Math.floor(prestigePoints)}</div>
            <div className='text-lg mb-4'>Available Colors: {availableColors.length}</div>
            <div className='text-lg mb-4'>Combination Streak: {combinationStreak}</div>
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
                  <div className='text-sm mt-1'>Combo: {button.combinationBonus.toFixed(2)}x</div>
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
              <Button onClick={prestige} variant='outline' disabled={clickCooldown}>
                Prestige (Requires {10000 * (prestigeLevel + 1)} points)
              </Button>
            </div>
          </div>
        </main>
        <Toaster />
      </div>
    </ToastProvider>
  )
}
