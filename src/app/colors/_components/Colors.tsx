'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { Info } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ColorButton {
  id: number;
  color: string;
  level: number;
  progress: number;
  clicks: number;
  trait: ColorTrait;
  unlocked: boolean;
}

enum ColorTrait {
  None = 'None',
  FastGrowing = 'Fast Growing',
  HighYield = 'High Yield',
  Multiplier = 'Multiplier',
  AutoClicker = 'Auto Clicker',
  ComboMaster = 'Combo Master',
  LuckyClicker = 'Lucky Clicker',
}

interface Skill {
  id: Skills;
  name: string;
  description: string;
  level: number;
  cost: number;
  maxLevel: number;
}

enum Skills {
  ClickPower = 0,
  TraitBoost = 1,
  AutoProgress = 2,
  ComboBoost = 3,
  ColorMastery = 4,
}

const defaultSkills: Skill[] = [
  {
    id: Skills.ClickPower,
    name: 'Click Power',
    description: 'Boosts the power of clicks',
    level: 1,
    cost: 10,
    maxLevel: 50,
  },
  {
    id: Skills.TraitBoost,
    name: 'Trait Boost',
    description: 'Boosts the chance of getting a trait',
    level: 0,
    cost: 25,
    maxLevel: 30,
  },
  {
    id: Skills.AutoProgress,
    name: 'Auto Progress',
    description: 'Automatically progresses colors',
    level: 0,
    cost: 50,
    maxLevel: 25,
  },
  {
    id: Skills.ComboBoost,
    name: 'Combo Boost',
    description: 'Boosts the combo multiplier',
    level: 0,
    cost: 100,
    maxLevel: 20,
  },
  {
    id: Skills.ColorMastery,
    name: 'Color Mastery',
    description: 'Boosts unlocking colors',
    level: 0,
    cost: 200,
    maxLevel: 15,
  },
];

const defaultColorButtons: ColorButton[] = [
  {
    id: 0,
    color: '#FF0000',
    level: 1,
    progress: 0,
    clicks: 0,
    trait: ColorTrait.None,
    unlocked: true,
  },
  {
    id: 1,
    color: '#00FF00',
    level: 1,
    progress: 0,
    clicks: 0,
    trait: ColorTrait.None,
    unlocked: true,
  },
  {
    id: 2,
    color: '#0000FF',
    level: 1,
    progress: 0,
    clicks: 0,
    trait: ColorTrait.None,
    unlocked: false,
  },
  {
    id: 3,
    color: '#FFFF00',
    level: 1,
    progress: 0,
    clicks: 0,
    trait: ColorTrait.None,
    unlocked: false,
  },
  {
    id: 4,
    color: '#FF00FF',
    level: 1,
    progress: 0,
    clicks: 0,
    trait: ColorTrait.None,
    unlocked: false,
  },
  {
    id: 5,
    color: '#00FFFF',
    level: 1,
    progress: 0,
    clicks: 0,
    trait: ColorTrait.None,
    unlocked: false,
  },
];

const effect = (skill: Skill): number => {
  switch (skill.id) {
    case Skills.ClickPower:
      return skill.level * 0.2;
    case Skills.TraitBoost:
      return skill.level * 0.05;
    case Skills.AutoProgress:
      return skill.level * 0.1;
    case Skills.ComboBoost:
      return skill.level * 0.3;
    case Skills.ColorMastery:
      return skill.level * 0.15;
  }
};

export default function Colors(): React.JSX.Element {
  const [colorButtons, setColorButtons] = usePersistentState<ColorButton[]>('colorButtons', defaultColorButtons, true);
  const [score, setScore] = useState(0);
  const [prestigeLevel, setPrestigeLevel] = usePersistentState<number>('prestigeLevel', 0, true);
  const [prestigePoints, setPrestigePoints] = usePersistentState<number>('prestigePoints', 0, true);
  const [clickCooldown, setClickCooldown] = useState(false);
  const lastClickTime = useRef(Date.now());
  const clickCount = useRef(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [combinationStreak, setCombinationStreak] = useState(0);
  const [skills, setSkills] = usePersistentState<Skill[]>('skills', defaultSkills, true);

  const checkAntiCheat = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime.current < 50) {
      clickCount.current++;
      if (clickCount.current > 10) {
        setClickCooldown(true);
        toast.error('Slow down!', {
          description: "You're clicking too fast. Please wait a moment.",
        });
        setTimeout(() => setClickCooldown(false), 2000);
        return false;
      }
    } else {
      clickCount.current = 0;
    }
    lastClickTime.current = now;
    return !clickCooldown;
  }, [clickCooldown]);

  const handleColorClick = useCallback(
    (index: number) => {
      if (!checkAntiCheat()) return;

      setColorButtons((prevButtons) => {
        const newButtons = [...prevButtons];
        const button = newButtons[index];
        const clickPowerBonus = effect(skills[Skills.ClickPower]);

        let progressIncrease = 10 * ((1 + clickPowerBonus) * (1 + prestigeLevel * 0.1));

        if (button.trait === ColorTrait.FastGrowing) {
          progressIncrease *= 1.5;
        }

        button.progress += progressIncrease;
        button.clicks += 1;

        const prestigeBoost = prestigeLevel * 0.1;

        for (let i = 0; i < button.progress; i += 100) {
          const extraProgress = button.progress - i;
          button.progress = extraProgress;
          button.level += 1;

          const colorMasteryBonus = effect(skills[Skills.ColorMastery]);
          let pointsEarned = button.level * 10 * (1 + colorMasteryBonus) * (1 + prestigeBoost);
          let prestigePointsEarned = button.level * 10 * ((1 + colorMasteryBonus) * (1 + prestigeBoost)) * 0.005;

          if (button.trait === ColorTrait.HighYield) {
            pointsEarned *= 2;
            prestigePointsEarned *= 2;
          }

          setScore((prevScore) => prevScore + pointsEarned);
          setPrestigePoints((prevPoints) => prevPoints + prestigePointsEarned);

          toast.success('Level Up!', {
            description: `Color leveled up to ${button.level}! Earned ${Math.floor(pointsEarned)} points.`,
          });
        }

        if (button.trait === ColorTrait.LuckyClicker && Math.random() < 0.1) {
          const bonusPoints = button.level * 50;
          setScore((prevScore) => prevScore + bonusPoints);
          setPrestigePoints((prevPoints) => prevPoints + bonusPoints * 0.02);
          toast.success('Lucky Click!', {
            description: `You got lucky! Earned ${bonusPoints} bonus points.`,
          });
        }

        return newButtons;
      });
    },
    [checkAntiCheat, setColorButtons, skills, prestigeLevel, setPrestigePoints],
  );

  const combineColors = (index1: number, index2: number) => {
    if (index1 === index2 || !checkAntiCheat()) return;

    setColorButtons((prevButtons) => {
      const newButtons = [...prevButtons];
      const button1 = newButtons[index1];
      const button2 = newButtons[index2];

      if (button1.clicks < 10 || button2.clicks < 10) {
        toast.error('Not enough clicks', {
          description: 'Each color needs at least 10 clicks before combining.',
        });
        return prevButtons;
      }

      const combinedLevel = Math.floor((button1.level + button2.level) / 2) + 1;
      const comboBoostBonus = effect(skills[Skills.ComboBoost]);
      const pointsEarned = combinedLevel * 50 * (1 + comboBoostBonus);
      setScore((prevScore) => prevScore + pointsEarned);
      setPrestigePoints((prevPoints) => prevPoints + pointsEarned * 0.01);
      const traitBoostBonus = effect(skills[Skills.TraitBoost]);

      const newTrait1 = Math.random() < 0.3 + traitBoostBonus ? getRandomTrait() : ColorTrait.None;
      const newTrait2 = Math.random() < 0.3 + traitBoostBonus ? getRandomTrait() : ColorTrait.None;

      newButtons[index1] = {
        ...button1,
        level: combinedLevel,
        progress: 0,
        clicks: 0,
        trait: newTrait1,
      };

      newButtons[index2] = {
        ...button2,
        level: 1,
        progress: 0,
        clicks: 0,
        trait: newTrait2,
      };

      const combinationBonus = combinedLevel * 100 * (1 + prestigeLevel * 0.2);
      setScore((prev) => prev + combinationBonus);
      setPrestigePoints((prev) => prev + combinationBonus * 0.02);

      setCombinationStreak((prev) => prev + 1);
      const streakBonus = Math.floor(combinationBonus * (combinationStreak * 0.1));
      setScore((prev) => prev + streakBonus);

      if (button1.trait === ColorTrait.ComboMaster || button2.trait === ColorTrait.ComboMaster) {
        const comboMasterBonus = combinationBonus * 0.5;
        setScore((prev) => prev + comboMasterBonus);
        setPrestigePoints((prev) => prev + comboMasterBonus * 0.02);
        toast.success('Combo Master Bonus!', {
          description: `Earned an extra ${Math.floor(comboMasterBonus)} points from Combo Master!`,
        });
      }

      toast.success('Combination Boost!', {
        description: `Colors combined! Earned ${Math.floor(combinationBonus)} points, ${Math.floor(combinationBonus * 0.02)} PP, and ${streakBonus} streak bonus!`,
      });

      if (newTrait1 !== ColorTrait.None && newTrait2 !== ColorTrait.None) {
        toast.success('New Traits Unlocked!', {
          description: `The combined colors gained the ${newTrait1} and ${newTrait2} traits!`,
        });
      } else if (newTrait1 !== ColorTrait.None || newTrait2 !== ColorTrait.None) {
        toast.success('New Trait Unlocked!', {
          description: `The combined color gained the ${newTrait1 !== ColorTrait.None ? newTrait1 : newTrait2} trait!`,
        });
      }

      return newButtons;
    });
  };

  const getRandomTrait = (): ColorTrait => {
    const traits = Object.values(ColorTrait).filter((trait) => trait !== ColorTrait.None);
    return traits[Math.floor(Math.random() * traits.length)] as ColorTrait;
  };

  const upgradeSkill = (skillId: Skills) => {
    if (!checkAntiCheat()) return;

    setSkills((prevSkills) => {
      const newSkills = [...prevSkills];
      const skill = newSkills[skillId];

      if (skill.level >= skill.maxLevel) {
        toast.error('Skill Maxed Out', {
          description: `${skill.name} is already at its maximum level.`,
        });
        return prevSkills;
      }

      const newPrestigePoints = prestigePoints - skill.cost;

      if (newPrestigePoints >= 0) {
        setPrestigePoints(newPrestigePoints);
        skill.level += 1;
        skill.cost = Math.floor(skill.cost * 1.5);

        toast.success('Skill Upgraded!', {
          description: `${skill.name} is now level ${skill.level}!`,
        });
      } else {
        toast.error('Not enough Prestige Points', {
          description: `You need ${skill.cost} Prestige Points to upgrade this skill.`,
        });
      }
      return newSkills;
    });
  };

  const prestige = () => {
    if (!checkAntiCheat()) return;

    const requiredScore = 10000 * (prestigeLevel + 1) ** 2;

    if (score < requiredScore) {
      toast.error('Not enough score', {
        description: `You need ${requiredScore} points to prestige.`,
      });
      return;
    }

    setPrestigeLevel((prev) => prev + 1);
    setScore(0);
    setColorButtons((prev) => {
      const newButtons = [...prev];
      newButtons.forEach((button) => {
        button.level = 1;
        button.progress = 0;
        button.clicks = 0;
        button.trait = getRandomTrait();
      });

      // Unlock a new color button if available
      const lockedButtons = newButtons.filter((button) => !button.unlocked);
      if (lockedButtons.length > 0) {
        lockedButtons[0].unlocked = true;
        toast.success('New Color Button Unlocked!');
      }

      return newButtons;
    });
    setCombinationStreak(0);
    toast.success(`Prestige!`, {
      description: `You've reached prestige level ${prestigeLevel + 1}!`,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setColorButtons((prevButtons) => {
        return prevButtons.map((button) => {
          if (button.trait === ColorTrait.AutoClicker) {
            handleColorClick(button.id);
          }
          const progressRate = 10 / button.level ** 1.2;
          return {
            ...button,
            progress: Math.min(button.progress + progressRate, 100),
          };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [skills, prestigeLevel, setColorButtons, handleColorClick]);

  useEffect(() => {
    const isComplete = colorButtons.find((button) => button.progress >= 100);
    if (isComplete) {
      setColorButtons((prev) =>
        prev.map((button) =>
          button.progress >= 100 ?
            {
              ...button,
              progress: button.progress - 100,
              level: button.level + 1,
            }
          : button,
        ),
      );
    }
  }, [colorButtons, setColorButtons]);

  const resetProgress = () => {
    setColorButtons(defaultColorButtons);
    setCombinationStreak(0);
    setPrestigeLevel(0);
    setPrestigePoints(0);
    setScore(0);
    setSkills(defaultSkills);
  };

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <div className='flex h-dvh w-dvw select-none'>
        <Sidebar>
          <SidebarContent className='p-2'>
            <SidebarHeader className='mb-4 text-center text-2xl font-bold'>Skills</SidebarHeader>
            <ScrollArea>
              {skills.map((skill) => (
                <SidebarGroup key={skill.id} className='my-2 rounded-lg bg-gray-50 shadow dark:bg-gray-800'>
                  <SidebarGroupLabel>
                    {skill.name}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='link'
                          className='p-0 text-sm font-normal text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        >
                          <Info className='ml-1 h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{skill.description}</TooltipContent>
                    </Tooltip>
                  </SidebarGroupLabel>

                  <SidebarGroupContent>
                    Level: {skill.level}/{skill.maxLevel}
                  </SidebarGroupContent>
                  <SidebarGroupContent>Effect: {(effect(skill) * 100).toFixed(1)}%</SidebarGroupContent>
                  <SidebarGroupContent>Cost: {skill.cost} PP</SidebarGroupContent>
                  <Button
                    onClick={() => upgradeSkill(skill.id)}
                    className='mt-2'
                    disabled={prestigePoints < skill.cost || skill.level >= skill.maxLevel}
                  >
                    {skill.level >= skill.maxLevel ? 'Maxed' : 'Upgrade'}
                  </Button>
                </SidebarGroup>
              ))}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
        <div className='p-4'>
          <SidebarTrigger className={`fixed left-2 top-2 z-50`} />
        </div>

        <main className='flex-1 overflow-y-auto p-8'>
          <div className='flex flex-col items-center justify-center gap-4 pt-36 text-xs sm:text-sm md:text-base'>
            <h1 className='mb-4 font-bold lg:text-4xl'>Stupid Color Game</h1>
            <div className='mb-2 lg:text-2xl'>Score: {Math.floor(score)}</div>
            <div className='mb-2 lg:text-xl'>Prestige Level: {prestigeLevel}</div>
            <div className='mb-2 lg:text-xl'>Prestige Points (PP): {Math.floor(prestigePoints)}</div>
            <div className='mb-2 lg:text-lg'>Combination Streak: {combinationStreak}</div>
            <div className='grid grid-cols-2 gap-4'>
              {colorButtons.map(
                (button, index) =>
                  button.unlocked && (
                    <div key={index} className='flex flex-col items-center self-center'>
                      <Button
                        onClick={() => handleColorClick(index)}
                        className='btn btn-circle rounded-full text-xs lg:h-24 lg:w-24'
                        style={{ backgroundColor: button.color }}
                        disabled={clickCooldown}
                      >
                        <div className='scale-25 xs:scale-50 sm:scale-75 md:scale-100'>Level {button.level}</div>
                      </Button>
                      <Progress value={button.progress} className='mt-2 lg:w-24' />
                      <div className='mt-1 lg:text-sm'>Clicks: {button.clicks}</div>
                      <div className='mt-1 lg:text-sm'>Trait: {button.trait}</div>
                    </div>
                  ),
              )}
            </div>
            <div className='mt-4'>
              <Button
                onClick={() => combineColors(0, 1)}
                className='mr-0 text-xs sm:mr-1 md:mr-2'
                disabled={clickCooldown || colorButtons[0].clicks < 10 || colorButtons[1].clicks < 10}
              >
                Combine 1 & 2
              </Button>
              {colorButtons[2]?.unlocked && colorButtons[3]?.unlocked && (
                <Button
                  onClick={() => combineColors(2, 3)}
                  className='mr-0 text-xs sm:mr-1 md:mr-2'
                  disabled={clickCooldown || (colorButtons[2]?.clicks ?? 0) < 10 || (colorButtons[3]?.clicks ?? 0) < 10}
                >
                  Combine 3 & 4
                </Button>
              )}
              {colorButtons[4]?.unlocked && colorButtons[5]?.unlocked && (
                <Button
                  onClick={() => combineColors(4, 5)}
                  className='mr-0 text-xs sm:mr-1 md:mr-2'
                  disabled={clickCooldown || (colorButtons[4]?.clicks ?? 0) < 10 || (colorButtons[5]?.clicks ?? 0) < 10}
                >
                  Combine 5 & 6
                </Button>
              )}
            </div>
            <div className='mt-4'>
              <Button onClick={prestige} variant='outline' disabled={clickCooldown}>
                Prestige (Requires {10000 * (prestigeLevel + 1) ** 2} points)
              </Button>
            </div>
          </div>
        </main>
      </div>
      <Button className='fixed right-0 top-0' onClick={resetProgress}>
        Reset Progress
      </Button>
    </SidebarProvider>
  );
}
