'use client'

import type React from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { Menu, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import PageBack from '@/components/PageBack'
import { usePersistentState } from '@/hooks/use-persistent-state'
import dynamic from 'next/dynamic'
import { ToastProvider } from '@/components/ui/toast'

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
  id: number
  color: string
  level: number
  progress: number
}

interface Skill {
  id: number
  name: string
  level: number
  cost: number
  effect: (level: number) => number
}

export function Colors(): React.JSX.Element {
  const [colorButtons, setColorButtons] = useState<ColorButton[]>([
    { id: 0, color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
    { id: 1, color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
    { id: 2, color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
    { id: 3, color: getRandomColor(initialColorClasses), level: 1, progress: 0 },
  ])
  const [score, setScore] = useState(0)
  const [prestigeLevel, setPrestigeLevel] = useState(0)
  const [prestigePoints, setPrestigePoints] = useState(0)
  const [clickCooldown, setClickCooldown] = useState(false)
  const [availableColors, setAvailableColors] = useState(initialColorClasses)
  const lastClickTime = useRef(Date.now())
  const clickCount = useRef(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const [skills, setSkills] = useState<Skill[]>([
    { id: 0, name: 'Click Power', level: 1, cost: 10, effect: (level) => level * 0.1 },
    { id: 1, name: 'Auto Progress', level: 0, cost: 50, effect: (level) => level * 0.05 },
    { id: 2, name: 'Combo Boost', level: 0, cost: 100, effect: (level) => level * 0.2 },
    { id: 3, name: 'Color Mastery', level: 0, cost: 200, effect: (level) => level * 0.1 },
  ])



  const effect = useCallback((skillId: number, level: number) => {
    const skillEffects = [
      {
        id: 0,
        effect: (level: number) => {
          return level * 0.1
        },
      },
      {
        id: 1,
        effect: (level: number) => {
          return level * 0.05
        },
      },
      {
        id: 2,
        effect: (level: number) => {
          return level * 0.2
        },
      },
      {
        id: 3,
        effect: (level: number) => {
          return level * 0.1
        },
      },
    ]
    // use skillEffects funtions to update the skill effect
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
      newButtons[index].progress += 10 * (1 + clickPowerBonus) * (1 + prestigeLevel * 0.1)
      if (newButtons[index].progress >= 100) {
        newButtons[index].progress = 0
        newButtons[index].level += 1
        newButtons[index].color = getRandomColor(availableColors)

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

        if (
          newButtons[index].level % 5 === 0 &&
          availableColors.length < initialColorClasses.length + advancedColorClasses.length
        ) {
          const newColorIndex = availableColors.length - initialColorClasses.length
          if (newColorIndex < advancedColorClasses.length) {
            setAvailableColors((prev) => [...prev, advancedColorClasses[newColorIndex]])

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
        ...newButtons[index1],
        color: combinedColor,
        level: combinedLevel,
        progress: 0,
      }

      newButtons[index2] = {
        ...newButtons[index2],
        color: getRandomColor(availableColors),
        level: 1,
        progress: 0,
      }

      const comboBoostSkill = skills.find((skill) => skill.id === 2)
      const comboBoostBonus = comboBoostSkill ? comboBoostSkill.effect(comboBoostSkill.level) : 0
      newButtons.forEach((button, idx) => {
        if (idx !== index1 && idx !== index2) {
          button.progress += 20 * (1 + comboBoostBonus) * (1 + prestigeLevel * 0.1)
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
      { id: 0, color: getRandomColor(availableColors), level: 1, progress: 0 },
      { id: 1, color: getRandomColor(availableColors), level: 1, progress: 0 },
      { id: 2, color: getRandomColor(availableColors), level: 1, progress: 0 },
      { id: 3, color: getRandomColor(availableColors), level: 1, progress: 0 },
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
        const autoProgressSkill = skills.find((skill) => skill.id === 1)
        const autoProgressBonus = effect(autoProgressSkill?.id ?? 0, autoProgressSkill?.level ?? 0)
        return prevButtons.map((button) => ({
          ...button,
          progress: Math.min(
            button.progress + (1 + autoProgressBonus) * (1 + prestigeLevel * 0.1),
            100,
          ),
        }))
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [skills, prestigeLevel, effect])

  useEffect(() => {
    // check if all colors that are at 100% progress
    const isComplete = colorButtons.filter((button) => button.progress === 100)
    isComplete.map((button) => {
      button.level++
      button.progress = 0
    })
    if (isComplete.length > 0) {
      // increase the level of the color class
      setColorButtons((prevButtons) => {
        return prevButtons.map((button) => {
          if (button.progress === 100) {
            return { ...button, progress: 0, level: button.level + 1 }
          } else {
            return button
          }
        })
      })
    }
  }, [colorButtons])

  return (
    <ToastProvider>
      <div className='flex h-dvh select-none w-dvw '>
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 p-4 overflow-y-auto border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}
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
                <p>Effect: {(skill.effect(skill.level) * 100).toFixed(1)}%</p>
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

        {/* PageBack component positioned to the right of the sidebar */}
        <PageBack className='md:ml-64 z-50' /> {/* Adjust margin as needed to align properly */}


        {/* Main content */}
        <main className='flex-1 p-8 overflow-y-auto'>
          <Button className='md:hidden mb-4' variant='outline' onClick={() => setIsSidebarOpen(true)}>
            <Menu className='h-4 w-4 mr-2' />
            Open Skills
          </Button>
          <div className='flex flex-col items-center justify-center pt-36 gap-4'>
            <h1 className='text-4xl font-bold mb-4'>Stupid Color Game (WIP)</h1>
            <div className='text-2xl mb-4'>Score: {Math.floor(score)}</div>
            <div className='text-xl mb-4'>Prestige Level: {prestigeLevel}</div>
            <div className='text-xl mb-4'>Prestige Points (PP): {Math.floor(prestigePoints)}</div>
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

export default dynamic(() => Promise.resolve(Colors), { ssr: false })