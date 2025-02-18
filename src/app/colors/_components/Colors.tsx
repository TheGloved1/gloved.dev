
"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePersistentState } from "@/hooks/use-persistent-state"
import { useToast } from "@/hooks/use-toast"
import { Menu, X } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"

interface ColorButton {
  id: number
  color: string
  level: number
  progress: number
  clicks: number
  trait: ColorTrait
  unlocked: boolean
}

enum ColorTrait {
  None = "None",
  FastGrowing = "Fast Growing",
  HighYield = "High Yield",
  Multiplier = "Multiplier",
  AutoClicker = "Auto Clicker",
  ComboMaster = "Combo Master",
  LuckyClicker = "Lucky Clicker",
}

interface Skill {
  id: Skills
  name: string
  level: number
  cost: number
  maxLevel: number
}

enum Skills {
  ClickPower = 0,
  AutoProgress = 1,
  ComboBoost = 2,
  ColorMastery = 3,
  CombinationExpertise = 4,
}

const defaultSkills: Skill[] = [
  { id: Skills.ClickPower, name: "Click Power", level: 1, cost: 10, maxLevel: 50 },
  { id: Skills.AutoProgress, name: "Auto Progress", level: 0, cost: 50, maxLevel: 25 },
  { id: Skills.ComboBoost, name: "Combo Boost", level: 0, cost: 100, maxLevel: 20 },
  { id: Skills.ColorMastery, name: "Color Mastery", level: 0, cost: 200, maxLevel: 15 },
  { id: Skills.CombinationExpertise, name: "Combination Expertise", level: 0, cost: 300, maxLevel: 10 },
]

const defaultColorButtons: ColorButton[] = [
  { id: 0, color: "#FF0000", level: 1, progress: 0, clicks: 0, trait: ColorTrait.None, unlocked: true },
  { id: 1, color: "#00FF00", level: 1, progress: 0, clicks: 0, trait: ColorTrait.None, unlocked: true },
  { id: 2, color: "#0000FF", level: 1, progress: 0, clicks: 0, trait: ColorTrait.None, unlocked: false },
  { id: 3, color: "#FFFF00", level: 1, progress: 0, clicks: 0, trait: ColorTrait.None, unlocked: false },
  { id: 4, color: "#FF00FF", level: 1, progress: 0, clicks: 0, trait: ColorTrait.None, unlocked: false },
  { id: 5, color: "#00FFFF", level: 1, progress: 0, clicks: 0, trait: ColorTrait.None, unlocked: false },
]

const effect = (skill: Skill): number => {
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
  const [colorButtons, setColorButtons] = usePersistentState<ColorButton[]>("colorButtons", defaultColorButtons, true)
  const [score, setScore] = useState(0)
  const [prestigeLevel, setPrestigeLevel] = usePersistentState<number>("prestigeLevel", 0, true)
  const [prestigePoints, setPrestigePoints] = usePersistentState<number>("prestigePoints", 0, true)
  const [clickCooldown, setClickCooldown] = useState(false)
  const lastClickTime = useRef(Date.now())
  const clickCount = useRef(0)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [combinationStreak, setCombinationStreak] = useState(0)
  const [skills, setSkills] = usePersistentState<Skill[]>("skills", defaultSkills, true)

  const checkAntiCheat = useCallback(() => {
    const now = Date.now()
    if (now - lastClickTime.current < 50) {
      clickCount.current++
      if (clickCount.current > 10) {
        setClickCooldown(true)
        toast({
          duration: 5000,
          title: "Slow down!",
          description: "You're clicking too fast. Please wait a moment.",
          variant: "destructive",
        })
        setTimeout(() => setClickCooldown(false), 2000)
        return false
      }
    } else {
      clickCount.current = 0
    }
    lastClickTime.current = now
    return !clickCooldown
  }, [clickCooldown, toast])

  const handleColorClick = useCallback(
    (index: number) => {
      if (!checkAntiCheat()) return

      setColorButtons((prevButtons) => {
        const newButtons = [...prevButtons]
        const button = newButtons[index]
        const clickPowerBonus = effect(skills[Skills.ClickPower])
        const combinationExpertiseBonus = effect(skills[Skills.CombinationExpertise])

        let progressIncrease = 10 * (1 + clickPowerBonus) * (1 + prestigeLevel * 0.1) * (1 + combinationExpertiseBonus)

        if (button.trait === ColorTrait.FastGrowing) {
          progressIncrease *= 1.5
        }

        button.progress += progressIncrease
        button.clicks += 1

        if (button.progress >= 100) {
          const extraProgress = button.progress - 100
          button.progress = extraProgress
          button.level += 1

          const colorMasteryBonus = effect(skills[Skills.ColorMastery])
          let pointsEarned = button.level * 10 * (1 + colorMasteryBonus) * (1 + prestigeLevel * 0.2)

          if (button.trait === ColorTrait.HighYield) {
            pointsEarned *= 2
          }

          setScore((prevScore) => prevScore + pointsEarned)
          setPrestigePoints((prevPoints) => prevPoints + pointsEarned * 0.01)

          toast({
            duration: 3000,
            title: "Level Up!",
            description: `Color leveled up to ${button.level}! Earned ${Math.floor(pointsEarned)} points.`,
          })
        }

        if (button.trait === ColorTrait.LuckyClicker && Math.random() < 0.1) {
          const bonusPoints = button.level * 50
          setScore((prevScore) => prevScore + bonusPoints)
          setPrestigePoints((prevPoints) => prevPoints + bonusPoints * 0.02)
          toast({
            duration: 3000,
            title: "Lucky Click!",
            description: `You got lucky! Earned ${bonusPoints} bonus points.`,
          })
        }

        console.log(newButtons)

        return newButtons
      })
    },
    [checkAntiCheat, setColorButtons, skills, prestigeLevel, setPrestigePoints, toast],
  ) // Updated dependencies

  const combineColors = (index1: number, index2: number) => {
    if (index1 === index2 || !checkAntiCheat()) return

    setColorButtons((prevButtons) => {
      const newButtons = [...prevButtons]
      const button1 = newButtons[index1]
      const button2 = newButtons[index2]

      if (button1.clicks < 10 || button2.clicks < 10) {
        toast({
          duration: 3000,
          title: "Not enough clicks",
          description: "Each color needs at least 10 clicks before combining.",
          variant: "destructive",
        })
        return prevButtons
      }

      const combinedLevel = Math.floor((button1.level + button2.level) / 2) + 1
      const comboBoostBonus = effect(skills[Skills.ComboBoost])
      const combinationExpertiseBonus = effect(skills[Skills.CombinationExpertise])

      const newTrait = Math.random() < 0.3 + combinationExpertiseBonus ? getRandomTrait() : ColorTrait.None

      newButtons[index1] = {
        ...button1,
        level: combinedLevel,
        progress: 0,
        clicks: 0,
        trait: newTrait,
      }

      newButtons[index2] = {
        ...button2,
        level: 1,
        progress: 0,
        clicks: 0,
        trait: ColorTrait.None,
      }

      const combinationBonus = combinedLevel * 100 * (1 + prestigeLevel * 0.2) * (1 + combinationExpertiseBonus)
      setScore((prev) => prev + combinationBonus)
      setPrestigePoints((prev) => prev + combinationBonus * 0.02)

      setCombinationStreak((prev) => prev + 1)
      const streakBonus = Math.floor(combinationBonus * (combinationStreak * 0.1))
      setScore((prev) => prev + streakBonus)

      if (button1.trait === ColorTrait.ComboMaster || button2.trait === ColorTrait.ComboMaster) {
        const comboMasterBonus = combinationBonus * 0.5
        setScore((prev) => prev + comboMasterBonus)
        setPrestigePoints((prev) => prev + comboMasterBonus * 0.02)
        toast({
          duration: 3000,
          title: "Combo Master Bonus!",
          description: `Earned an extra ${Math.floor(comboMasterBonus)} points from Combo Master!`,
        })
      }

      toast({
        duration: 3000,
        title: "Combination Boost!",
        description: `Colors combined! Earned ${Math.floor(combinationBonus)} points, ${Math.floor(combinationBonus * 0.02)} PP, and ${streakBonus} streak bonus!`,
      })

      if (newTrait !== ColorTrait.None) {
        toast({
          duration: 5000,
          title: "New Trait Unlocked!",
          description: `The combined color gained the ${newTrait} trait!`,
        })
      }

      return newButtons
    })
  }

  const getRandomTrait = (): ColorTrait => {
    const traits = Object.values(ColorTrait).filter((trait) => trait !== ColorTrait.None)
    return traits[Math.floor(Math.random() * traits.length)] as ColorTrait
  }

  const upgradeSkill = (skillId: Skills) => {
    if (!checkAntiCheat()) return

    setSkills((prevSkills) => {
      const newSkills = [...prevSkills]
      const skill = newSkills[skillId]

      if (skill.level >= skill.maxLevel) {
        toast({
          duration: 3000,
          title: "Skill Maxed Out",
          description: `${skill.name} is already at its maximum level.`,
          variant: "destructive",
        })
        return prevSkills
      }

      const newPrestigePoints = prestigePoints - skill.cost

      if (newPrestigePoints >= 0) {
        setPrestigePoints(newPrestigePoints)
        skill.level += 1
        skill.cost = Math.floor(skill.cost * 1.5)

        toast({
          duration: 3000,
          title: "Skill Upgraded!",
          description: `${skill.name} is now level ${skill.level}!`,
        })
      } else {
        toast({
          duration: 3000,
          title: "Not enough Prestige Points",
          description: `You need ${skill.cost} Prestige Points to upgrade this skill.`,
          variant: "destructive",
        })
      }
      return newSkills
    })
  }

  const prestige = () => {
    if (!checkAntiCheat()) return

    const requiredScore = 10000 * (prestigeLevel + 1) ** 2

    if (score < requiredScore) {
      toast({
        duration: 5000,
        title: "Not enough score",
        description: `You need ${requiredScore} points to prestige.`,
        variant: "destructive",
      })
      return
    }

    setPrestigeLevel((prev) => prev + 1)
    setScore(0)
    setColorButtons((prev) => {
      const newButtons = [...prev]
      newButtons.forEach((button) => {
        button.level = 1
        button.progress = 0
        button.clicks = 0
        button.trait = ColorTrait.None
      })

      // Unlock a new color button if available
      const lockedButtons = newButtons.filter((button) => !button.unlocked)
      if (lockedButtons.length > 0) {
        lockedButtons[0].unlocked = true
        toast({
          duration: 5000,
          title: "New Color Button Unlocked!",
          description: `You've unlocked a new color button!`,
        })
      }

      return newButtons
    })
    setCombinationStreak(0)
    toast({
      duration: 5000,
      title: "Prestige!",
      description: `You've reached prestige level ${prestigeLevel + 1}!`,
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setColorButtons((prevButtons) => {
        const autoProgressBonus = effect(skills[Skills.AutoProgress])
        return prevButtons.map((button) => {
          if (button.trait === ColorTrait.AutoClicker) {
            handleColorClick(button.id)
          }
          return {
            ...button,
            progress: Math.min(button.progress + (1 + autoProgressBonus) * (1 + prestigeLevel * 0.1), 100),
          }
        })
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [skills, prestigeLevel, setColorButtons, handleColorClick]) // Removed handleColorClick from dependencies

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
      <div className="flex h-dvh select-none w-dvw">
        <Sidebar>
          <SidebarContent>
            <SidebarTrigger
              className="md:hidden absolute top-4 right-4"
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </SidebarTrigger>
            <SidebarHeader className="text-2xl font-bold mb-4 text-right">Skills</SidebarHeader>
            <ScrollArea className="h-[calc(100vh-5rem)]">
              {skills.map((skill) => (
                <SidebarGroup key={skill.name} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
                  <SidebarGroupLabel>{skill.name}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    Level: {skill.level}/{skill.maxLevel}
                  </SidebarGroupContent>
                  <SidebarGroupContent>Effect: {(effect(skill) * 100).toFixed(1)}%</SidebarGroupContent>
                  <SidebarGroupContent>Cost: {skill.cost} PP</SidebarGroupContent>
                  <Button
                    onClick={() => upgradeSkill(skill.id)}
                    className="mt-2"
                    disabled={prestigePoints < skill.cost || skill.level >= skill.maxLevel}
                  >
                    {skill.level >= skill.maxLevel ? "Maxed" : "Upgrade"}
                  </Button>
                </SidebarGroup>
              ))}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 p-8 overflow-y-auto">
          <SidebarTrigger variant="outline">
            <Menu className="h-4 w-4 mr-2" />
            Open Skills
          </SidebarTrigger>
          <div className="flex flex-col items-center justify-center pt-36 gap-4 text-xs sm:text-sm md:text-base">
            <h1 className="lg:text-4xl font-bold mb-4">Color Evolution Game</h1>
            <div className="lg:text-2xl mb-2">Score: {Math.floor(score)}</div>
            <div className="lg:text-xl mb-2">Prestige Level: {prestigeLevel}</div>
            <div className="lg:text-xl mb-2">Prestige Points (PP): {Math.floor(prestigePoints)}</div>
            <div className="lg:text-lg mb-2">Combination Streak: {combinationStreak}</div>
            <div className="grid grid-cols-2 gap-4">
              {colorButtons.map(
                (button, index) =>
                  button.unlocked && (
                    <div key={index} className="flex flex-col items-center">
                      <Button
                        onClick={() => handleColorClick(index)}
                        className="btn btn-circle text-xs rounded-full lg:w-24 lg:h-24"
                        style={{ backgroundColor: button.color }}
                        disabled={clickCooldown}
                      >
                        <div className="scale-50 sm:scale-75 lg:scale-100">Level {button.level}</div>
                      </Button>
                      <Progress value={button.progress} className="lg:w-24 mt-2" />
                      <div className="lg:text-sm mt-1">Clicks: {button.clicks}</div>
                      <div className="lg:text-sm mt-1">Trait: {button.trait}</div>
                    </div>
                  ),
              )}
            </div>
            <div className="mt-4">
              <Button
                onClick={() => combineColors(0, 1)}
                className="mr-0 text-xs sm:mr-1 md:mr-2"
                disabled={clickCooldown || colorButtons[0].clicks < 10 || colorButtons[1].clicks < 10}
              >
                Combine 1 & 2
              </Button>
              <Button
                onClick={() => combineColors(2, 3)}
                className="mr-0 text-xs sm:mr-1 md:mr-2"
                disabled={
                  clickCooldown ||
                  !colorButtons[2]?.unlocked ||
                  !colorButtons[3]?.unlocked ||
                  (colorButtons[2]?.clicks ?? 0) < 10 ||
                  (colorButtons[3]?.clicks ?? 0) < 10
                }
              >
                Combine 3 & 4
              </Button>
              {colorButtons[4]?.unlocked && colorButtons[5]?.unlocked && (
                <Button
                  onClick={() => combineColors(4, 5)}
                  className="mr-0 text-xs sm:mr-1 md:mr-2"
                  disabled={clickCooldown || (colorButtons[4]?.clicks ?? 0) < 10 || (colorButtons[5]?.clicks ?? 0) < 10}
                >
                  Combine 5 & 6
                </Button>
              )}
            </div>
            <div className="mt-4">
              <Button onClick={prestige} variant="outline" disabled={clickCooldown}>
                Prestige (Requires {10000 * (prestigeLevel + 1) ** 2} points)
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Button className="fixed top-0 right-0" onClick={resetProgress}>
        Reset Progress
      </Button>
    </SidebarProvider>
  )
}

