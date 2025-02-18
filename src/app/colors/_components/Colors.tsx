'use client'

import type React from 'react'

import PageBack from '@/components/PageBack'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { useToast } from '@/hooks/use-toast'
import { Menu, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { progress } from 'framer-motion'

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
  id: Skills
  name: string
  level: number
  cost: number
}

enum Skills {
  ClickPower = 0,
  AutoProgress = 1,
  ComboBoost = 2,
  ColorMastery = 3,
  CombinationExpertise = 4,
}

const defaultSkills: Skill[] = [
  { id: Skills.ClickPower, name: 'Click Power', level: 1, cost: 10 },
  { id: Skills.AutoProgress, name: 'Auto Progress', level: 0, cost: 50 },
  { id: Skills.ComboBoost, name: 'Combo Boost', level: 0, cost: 100 },
  { id: Skills.ColorMastery, name: 'Color Mastery', level: 0, cost: 200 },
  { id: Skills.CombinationExpertise, name: 'Combination Expertise', level: 0, cost: 300 },
]

const defaultColorButtons: ColorButton[] = [
  { id: 0, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
  { id: 1, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
  { id: 2, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
  { id: 3, color: colorProgression[0], level: 1, progress: 0, combinationBonus: 0 },
]

const effect = (skill: Skill) => {
  switch (skill.id) {
    case Skills.ClickPower:
      return skill.level * 0.2
    case Skills.AutoProgress:
      return skill.level * 0.1
    case Skills.ComboBoost:
      return skill.level * 0.3
    case Skills.ColorMastery:
      return skill.level * 0.15
    case Skills.CombinationExpertise:
      return skill.level * 0.25
  }
}

export default function Colors(): React.JSX.Element {
  const { toast } = useToast()
  const [colorButtons, setColorButtons] = usePersistentState<ColorButton[]>('colorButtons', defaultColorButtons, true)
  const [score, setScore] = useState(0)
  const [prestigeLevel, setPrestigeLevel] = usePersistentState<number>('prestigeLevel', 0, true)
  const [prestigePoints, setPrestigePoints] = usePersistentState<number>('prestigePoints', 0, true)
  const [clickCooldown, setClickCooldown] = useState(false)
  const [availableColors, setAvailableColors] = usePersistentState<string[]>('availableColors', [colorProgression[0]], true)
  const lastClickTime = useRef(Date.now())
  const clickCount = useRef(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [combinationStreak, setCombinationStreak] = useState(0)
  const [skills, setSkills] = usePersistentState<Skill[]>('skills', defaultSkills, true)

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
      const clickPowerBonus = effect(skills[Skills.ClickPower])
      const combinationExpertiseBonus = effect(skills[Skills.CombinationExpertise])

      const progressIncrease =
        10 *
        (1 + clickPowerBonus) *
        (1 + prestigeLevel * 0.1) *
        (1 + newButtons[index].combinationBonus * combinationExpertiseBonus)
      newButtons[index].progress += progressIncrease

      if (newButtons[index].progress >= 100) {
        const extraProgress = newButtons[index].progress - 100
        newButtons[index].progress = extraProgress
        newButtons[index].level += 1
        const nextColorIndex = Math.min(newButtons[index].level - 1, colorProgression.length - 1)
        newButtons[index].color = colorProgression[nextColorIndex]

        const colorMasteryBonus = effect(skills[Skills.ColorMastery])
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
          setScore((prev) => prev + unlockBonus)
          setPrestigePoints((prev) => prev + unlockBonus * 0.01)

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

      const comboBoostBonus = effect(skills[Skills.ComboBoost])
      const combinationExpertiseBonus = effect(skills[Skills.CombinationExpertise])

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
      setScore((prev) => prev + combinationBonus)
      setPrestigePoints((prev) => prev + combinationBonus * 0.02)

      setCombinationStreak((prev) => prev + 1)
      const streakBonus = Math.floor(combinationBonus * (combinationStreak * 0.1))
      setScore((prev) => prev + streakBonus)

      toast({
        duration: 3000,
        title: 'Combination Boost!',
        description: `Colors combined! Earned ${Math.floor(combinationBonus)} points, ${Math.floor(combinationBonus * 0.02)} PP, and ${streakBonus} streak bonus!`,
      })

      return newButtons
    })
  }

  const upgradeSkill = (skillId: Skills) => {
    if (!checkAntiCheat()) return

    setSkills((prevSkills) => {
      const newSkills = [...prevSkills]
      const newPrestigePoints = prestigePoints - newSkills[skillId].cost // Calculate new prestige points

      if (newPrestigePoints >= 0) { // Check if enough points
        setPrestigePoints(newPrestigePoints) // Deduct points
        newSkills[skillId].level += 1

        toast({
          duration: 3000,
          title: 'Skill Upgraded!',
          description: `${newSkills[skillId].name} is now level ${newSkills[skillId].level}!`,
        })
      } else {
        toast({
          duration: 3000,
          title: 'Not enough Prestige Points',
          description: `You need ${newSkills[skillId].cost} Prestige Points to upgrade this skill.`,
          variant: 'destructive',
        })
      }
      return newSkills
    })
    setSkills((prevSkills) => {
      const newSkills = [...prevSkills]
      newSkills[skillId].cost = Math.floor(newSkills[skillId].cost * 1.5)
      return newSkills
    })
  }

  const prestige = () => {
    if (!checkAntiCheat()) return

    const requiredScore = 10000 * (prestigeLevel + 1) ** 2

    if (score < requiredScore) {
      toast({
        duration: 5000,
        title: 'Not enough score',
        description: `You need ${requiredScore} points to prestige.`,
        variant: 'destructive',
      })
      return
    }

    setPrestigeLevel((prev) => prev + 1)
    setScore(0)
    setColorButtons(defaultColorButtons)
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
        const autoProgressBonus = effect(skills[Skills.AutoProgress])
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
  }, [skills, prestigeLevel, setColorButtons])

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

  const resetProgress = () => {
    setColorButtons(defaultColorButtons)
    setCombinationStreak(0)
    setPrestigeLevel(0)
    setPrestigePoints(0)
    setScore(0)
    setSkills(defaultSkills)
  }

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className='flex h-dvh select-none w-dvw'>
        <Sidebar>
          <SidebarContent>
            <SidebarTrigger
              className='md:hidden absolute top-4 right-4'
              variant='ghost'
              size='icon'
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className='h-4 w-4' />
            </SidebarTrigger>
            <SidebarHeader className='text-2xl font-bold mb-4 text-right'>Skills</SidebarHeader>
            <ScrollArea className='h-[calc(100vh-5rem)]'>
              {skills.map((skill, index) => (
                <SidebarGroup
                  key={skill.name}
                  className='mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow'
                >
                  <SidebarGroupLabel>{skill.name}</SidebarGroupLabel>
                  <SidebarGroupContent>Level: {skill.level}</SidebarGroupContent>
                  <SidebarGroupContent>
                    Effect: {(effect(skill) * 100).toFixed(1)}%
                  </SidebarGroupContent>
                  <SidebarGroupContent>Cost: {skill.cost} PP</SidebarGroupContent>
                  <Button
                    onClick={() => upgradeSkill(skill.id)}
                    className='mt-2'
                    disabled={prestigePoints < skill.cost}
                  >
                    Upgrade
                  </Button>
                </SidebarGroup>
              ))}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        <main className='flex-1 p-8 overflow-y-auto'>
          <SidebarTrigger variant='outline'>
            <Menu className='h-4 w-4 mr-2' />
            Open Skills
          </SidebarTrigger>
          <div className='flex flex-col items-center justify-center pt-36 gap-4 text-xs sm:text-sm md:text-base'>
            <h1 className='lg:text-4xl font-bold mb-4'>Stupid Color Game</h1>
            <div className='lg:text-2xl mb-2'>Score: {Math.floor(score)}</div>
            <div className='lg:text-xl mb-2'>Prestige Level: {prestigeLevel}</div>
            <div className='lg:text-xl mb-2'>
              Prestige Points (PP): {Math.floor(prestigePoints)}
            </div>
            <div className='lg:text-lg mb-2'>Available Colors: {availableColors.length}</div>
            <div className='lg:text-lg mb-2'>Combination Streak: {combinationStreak}</div>
            <div className='grid grid-cols-2 gap-4'>
              {colorButtons.map((button, index) => (
                <div key={index} className='flex flex-col items-center'>
                  <Button
                    onClick={() => handleColorClick(index)}
                    className='btn btn-circle text-xs rounded-full lg:w-24 lg:h-24'
                    style={{ backgroundColor: button.color }}
                    disabled={clickCooldown}
                  >
                    <div className='scale-50 sm:scale-75 lg:scale-100'>Level {button.level}</div>
                  </Button>
                  <Progress value={button.progress} className='lg:w-24 mt-2' />
                  <div className='lg:text-sm mt-1'>
                    Combo: {button.combinationBonus.toFixed(2)}x
                  </div>
                </div>
              ))}
            </div>
            <div className='mt-4'>
              <Button
                onClick={() => combineColors(0, 1)}
                className='mr-0 text-xs sm:mr-1 md:mr-2'
                disabled={clickCooldown}
              >
                Combine 1 & 2
              </Button>
              <Button
                onClick={() => combineColors(2, 3)}
                className='mr-0 text-xs sm:mr-1 md:mr-2'
                disabled={clickCooldown}
              >
                Combine 3 & 4
              </Button>
            </div>
            <div className='mt-4'>
              <Button onClick={prestige} variant='outline' disabled={clickCooldown}>
                Prestige (Requires {10000 * (prestigeLevel + 1) ** 2} points)
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Button className='fixed top-0 right-0' onClick={resetProgress}>
        Reset Progress
      </Button>
    </SidebarProvider>
  )
}
