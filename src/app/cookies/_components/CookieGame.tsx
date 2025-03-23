'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInterval } from '@/hooks/use-interval';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { ArrowBigUp, MousePointer, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

// Game data
const UPGRADES = [
  { id: 'cursor', name: 'Cursor', baseCost: 15, cps: 0.1, description: 'Autoclicks once every 10 seconds' },
  { id: 'grandma', name: 'Grandma', baseCost: 100, cps: 1, description: 'A nice grandma to bake cookies' },
  { id: 'farm', name: 'Farm', baseCost: 1100, cps: 8, description: 'Grows cookie plants from cookie seeds' },
  { id: 'mine', name: 'Mine', baseCost: 12000, cps: 47, description: 'Mines cookie dough from the cookie mines' },
  { id: 'factory', name: 'Factory', baseCost: 130000, cps: 260, description: 'Produces large quantities of cookies' },
];

// Change the CPC_UPGRADES array to adjust base costs for better balance with new scaling
const CPC_UPGRADES = [
  {
    id: 'reinforcedFinger',
    name: 'Reinforced Finger',
    baseCost: 10,
    cpcBonus: 0.1,
    description: 'Slightly strengthens your clicking finger',
  },
  {
    id: 'cookieTongs',
    name: 'Cookie Tongs',
    baseCost: 75,
    cpcBonus: 0.3,
    description: 'Basic tongs for more efficient cookie handling',
  },
  {
    id: 'bakingGloves',
    name: 'Baking Gloves',
    baseCost: 550,
    cpcBonus: 1.0,
    description: 'Heat-resistant gloves improve cookie production',
  },
  {
    id: 'clickingRobot',
    name: 'Clicking Robot',
    baseCost: 4000,
    cpcBonus: 3.0,
    description: 'A simple mechanical arm that assists with clicking',
  },
  {
    id: 'quantumClicker',
    name: 'Quantum Clicker',
    baseCost: 30000,
    cpcBonus: 10.0,
    description: 'Clicks in multiple dimensions simultaneously',
  },
];

const POWERUPS = [
  {
    id: 'doubleClick',
    name: 'Double Click',
    cost: 500,
    duration: 30,
    effect: 2,
    description: 'Doubles your click power for 30 seconds',
  },
  {
    id: 'frenzy',
    name: 'Cookie Frenzy',
    cost: 5000,
    duration: 15,
    effect: 7,
    description: 'Multiplies CPS by 7 for 15 seconds',
  },
  {
    id: 'luckyDay',
    name: 'Lucky Day',
    cost: 7500,
    duration: 10,
    effect: 'random',
    description: 'Random cookie bonus between 10-30% of your bank',
  },
];

const ACHIEVEMENTS = [
  { id: 'firstCookie', name: 'First Cookie', requirement: 1, description: 'Bake your first cookie', icon: '🍪' },
  { id: 'hundredCookies', name: 'Cookie Novice', requirement: 100, description: 'Bake 100 cookies', icon: '🥉' },
  {
    id: 'thousandCookies',
    name: 'Cookie Enthusiast',
    requirement: 1000,
    description: 'Bake 1,000 cookies',
    icon: '🥈',
  },
  {
    id: 'millionCookies',
    name: 'Cookie Master',
    requirement: 1000000,
    description: 'Bake 1,000,000 cookies',
    icon: '🥇',
  },
  {
    id: 'firstUpgrade',
    name: 'Helping Hand',
    requirement: 'upgrade',
    description: 'Purchase your first upgrade',
    icon: '🛒',
  },
  {
    id: 'fiveUpgrades',
    name: 'Freddy Five Bear',
    requirement: 'upgrades5',
    description: 'Own 5 different types of upgrades. You want him?',
    icon: '🏭',
  },
  {
    id: 'clickMaster',
    name: 'Click Master',
    requirement: 'cpc2',
    description: 'Reach 2 cookies per click',
    icon: '👆',
  },
  {
    id: 'clickGod',
    name: 'Click God',
    requirement: 'cpc10',
    description: 'Reach 10 cookies per click',
    icon: '✨',
  },
];

// Sound effects - using simple audio context for sound effects
const useSoundEffects = () => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = usePersistentState('soundEnabled', true);

  useEffect(() => {
    // Only create AudioContext when needed (on first interaction)
    if (typeof window !== 'undefined' && soundEnabled && !audioContext) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          setAudioContext(new AudioContextClass());
        }
      } catch (e) {
        console.warn('Web Audio API not supported in this browser');
        toast.error('Web Audio API not supported in this browser');
      }
    }
  }, [soundEnabled, audioContext]);

  const playSound = (type: 'click' | 'purchase' | 'achievement' | 'powerup') => {
    if (!soundEnabled || !audioContext) return;

    try {
      // Create oscillator for simple sounds
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      // Configure sound based on type
      switch (type) {
        case 'click':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          break;
        case 'purchase':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          break;
        case 'achievement':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(900, audioContext.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          break;
        case 'powerup':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          break;
      }

      // Connect and start
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn('Error playing sound effect:', e);
    }
  };

  return { soundEnabled, setSoundEnabled, playSound };
};

export function CookieGame() {
  // Game state
  const [cookies, setCookies] = usePersistentState('cookies', 0);
  const [totalCookies, setTotalCookies] = usePersistentState('totalCookies', 0);
  const [clickPower, setClickPower] = useState(1);
  const [baseCpc, setBaseCpc] = usePersistentState('baseCpc', 1); // Base cookies per click
  const [cps, setCps] = usePersistentState('cps', 0);
  const [ownedUpgrades, setOwnedUpgrades] = usePersistentState<Record<string, number>>('ownedUpgrades', {});
  const [ownedCpcUpgrades, setOwnedCpcUpgrades] = usePersistentState<Record<string, number>>('ownedCpcUpgrades', {});
  const [activePowerups, setActivePowerups] = useState<
    Record<string, { startTime: number; duration: number; multiplier: number }>
  >({});
  const [unlockedAchievements, setUnlockedAchievements] = usePersistentState<string[]>('unlockedAchievements', []);
  const [prestigeLevel, setPrestigeLevel] = usePersistentState('prestigeLevel', 0);
  const [prestigeMultiplier, setPrestigeMultiplier] = usePersistentState('prestigeMultiplier', 1);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number; value: string; x: number; y: number }[]>([]);
  const [nextFloatingId, setNextFloatingId] = useState(0);
  const [activeTab, setActiveTab] = useState('cps');
  const [lastGameUpdate, setGameLastUpdate] = usePersistentState('lastGameUpdate', Date.now());

  const { soundEnabled, setSoundEnabled, playSound } = useSoundEffects();

  // Calculate prestige cost
  const prestigeCost = 1000000 * (prestigeLevel + 1);

  // Function to check and unlock achievements
  const checkAchievement = useCallback(
    (achievementId: string) => {
      if (unlockedAchievements.includes(achievementId)) return;

      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return;

      setUnlockedAchievements((prev) => [...prev, achievementId]);
      playSound('achievement');

      toast(`Achievement Unlocked: ${achievement.name}`, {
        description: achievement.description,
      });
    },
    [playSound, setUnlockedAchievements, unlockedAchievements],
  );

  // Calculate effective CPC with all bonuses
  const calculateEffectiveCpc = useCallback(() => {
    let effectiveCpc = baseCpc * prestigeMultiplier;

    // Apply active powerups
    if (activePowerups.doubleClick) {
      effectiveCpc *= activePowerups.doubleClick.multiplier;
    }

    return effectiveCpc;
  }, [activePowerups.doubleClick, baseCpc, prestigeMultiplier]);

  // Click the cookie
  const handleCookieClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const effectiveCpc = calculateEffectiveCpc();

    setCookies((prev) => prev + effectiveCpc);
    setTotalCookies((prev) => prev + effectiveCpc);
    playSound('click');

    // Create floating text
    const rect = e.currentTarget.getBoundingClientRect();
    const randomX = Math.random() * 35 - 35;
    const randomY = Math.random() * 35 - 35;
    const x = e.clientX - rect.left + randomX;
    const y = e.clientY - rect.top - 10 + randomY;

    setFloatingTexts((prev) => [
      ...prev,
      {
        id: nextFloatingId,
        value: `+${effectiveCpc.toFixed(1)}`,
        x,
        y,
      },
    ]);
    setNextFloatingId((prev) => prev + 1);

    // Remove floating text after animation
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((text) => text.id !== nextFloatingId - 1));
    }, 1000);
  };

  // Purchase a CPS upgrade
  const purchaseUpgrade = (upgradeId: string) => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    const owned = ownedUpgrades[upgradeId] || 0;
    const cost = Math.ceil(upgrade.baseCost * Math.pow(1.15, owned));

    if (cookies >= cost) {
      setCookies((prev) => prev - cost);
      setOwnedUpgrades((prev) => ({
        ...prev,
        [upgradeId]: (prev[upgradeId] || 0) + 1,
      }));

      // Update CPS
      setCps((prev) => prev + upgrade.cps * prestigeMultiplier);

      playSound('purchase');

      // Check for first upgrade achievement
      if (Object.keys(ownedUpgrades).length === 0 && Object.keys(ownedCpcUpgrades).length === 0) {
        checkAchievement('firstUpgrade');
      }

      // Check for 5 different upgrades achievement
      const totalUniqueUpgrades = new Set([...Object.keys(ownedUpgrades), ...Object.keys(ownedCpcUpgrades)]).size;

      if (!ownedUpgrades[upgradeId] && totalUniqueUpgrades === 4) {
        checkAchievement('fiveUpgrades');
      }
    }
  };

  // Purchase a CPC upgrade
  const purchaseCpcUpgrade = (upgradeId: string) => {
    const upgrade = CPC_UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return;

    const owned = ownedCpcUpgrades[upgradeId] || 0;
    const cost = Math.ceil(upgrade.baseCost * Math.pow(1.15, owned));

    if (cookies >= cost) {
      setCookies((prev) => prev - cost);
      setOwnedCpcUpgrades((prev) => ({
        ...prev,
        [upgradeId]: (prev[upgradeId] || 0) + 1,
      }));

      // Update base CPC
      setBaseCpc((prev) => prev + upgrade.cpcBonus);

      playSound('purchase');

      // Check for first upgrade achievement
      if (Object.keys(ownedUpgrades).length === 0 && Object.keys(ownedCpcUpgrades).length === 0) {
        checkAchievement('firstUpgrade');
      }

      // Check for 5 different upgrades achievement
      const totalUniqueUpgrades = new Set([...Object.keys(ownedUpgrades), ...Object.keys(ownedCpcUpgrades)]).size;

      if (!ownedCpcUpgrades[upgradeId] && totalUniqueUpgrades === 4) {
        checkAchievement('fiveUpgrades');
      }

      // Check for CPC achievements
      const newCpc = baseCpc + upgrade.cpcBonus;
      if (newCpc >= 2) {
        checkAchievement('clickMaster');
      }
      if (newCpc >= 10) {
        checkAchievement('clickGod');
      }
    }
  };

  // Activate a powerup
  const activatePowerup = (powerupId: string) => {
    const powerup = POWERUPS.find((p) => p.id === powerupId);
    if (!powerup || cookies < powerup.cost) return;

    setCookies((prev) => prev - powerup.cost);
    playSound('powerup');

    if (powerup.id === 'luckyDay') {
      // Lucky day gives random bonus between 10-30% of current cookies
      const bonusPercent = Math.random() * 20 + 10;
      const bonus = Math.ceil((cookies - powerup.cost) * (bonusPercent / 100));
      setCookies((prev) => prev + bonus);
      setTotalCookies((prev) => prev + bonus);

      toast('Lucky Day!', {
        description: `You received a bonus of ${bonus} cookies (${bonusPercent.toFixed(1)}%)`,
      });
    } else {
      // Other powerups have duration and multiplier
      setActivePowerups((prev) => ({
        ...prev,
        [powerupId]: {
          startTime: Date.now(),
          duration: powerup.duration,
          multiplier: typeof powerup.effect === 'number' ? powerup.effect : 1,
        },
      }));

      toast(`${powerup.name} Activated!`, {
        description: powerup.description,
      });
    }
  };

  // Game loop for auto-clickers and powerups
  useInterval(() => {
    const now = Date.now();
    const deltaTime = (now - lastGameUpdate) / 1000; // Convert to seconds
    setGameLastUpdate(now);

    // Auto-generate cookies based on CPS
    if (cps > 0) {
      const cookiesToAdd = effectiveCPS() * deltaTime;
      setCookies((prev) => prev + cookiesToAdd);
      setTotalCookies((prev) => prev + cookiesToAdd);
    }

    // Check for cookie count achievements
    ACHIEVEMENTS.forEach((achievement) => {
      if (typeof achievement.requirement === 'number' && totalCookies >= achievement.requirement) {
        checkAchievement(achievement.id);
      }
    });

    // Update powerup timers
    setActivePowerups((prev) => {
      const updated = { ...prev };
      let changed = false;

      Object.keys(updated).forEach((id) => {
        if (updated[id].startTime + updated[id].duration * 1000 <= now) {
          delete updated[id];
          changed = true;

          toast(`${POWERUPS.find((p) => p.id === id)?.name} Expired`, {
            description: 'The powerup effect has worn off.',
          });
        }
      });

      return changed ? updated : prev;
    });
  }, 100);

  // Calculate effective CPS with powerups
  const effectiveCPS = () => {
    let result = cps;
    if (activePowerups.frenzy) {
      result *= activePowerups.frenzy.multiplier;
    }
    return result;
  };

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toFixed(num % 1 === 0 ? 0 : 1);
    }
  };

  // Calculate upgrade cost
  const getUpgradeCost = (upgradeId: string) => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return 0;

    const owned = ownedUpgrades[upgradeId] || 0;
    return Math.ceil(upgrade.baseCost * Math.pow(1.15, owned));
  };

  // Modify the getCpcUpgradeCost function to use a steeper scaling factor of 1.35 (35%)
  // Replace the existing getCpcUpgradeCost function with this one
  const getCpcUpgradeCost = (upgradeId: string) => {
    const upgrade = CPC_UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return 0;

    const owned = ownedCpcUpgrades[upgradeId] || 0;
    return Math.ceil(upgrade.baseCost * Math.pow(1.35, owned)); // Changed from 1.15 to 1.35
  };

  // Prestige reset
  const prestige = () => {
    if (cookies < prestigeCost) return;

    setPrestigeLevel((prev) => prev + 1);
    setPrestigeMultiplier((prev) => prev + 0.2);

    // Reset game state but keep achievements
    setCookies(0);
    setCps(0);
    setBaseCpc(1);
    setOwnedUpgrades({});
    setOwnedCpcUpgrades({});
    setActivePowerups({});

    toast('Prestige Level Up!', {
      description: `You've reached prestige level ${prestigeLevel + 1}. All production multiplied by ${(prestigeMultiplier + 0.2).toFixed(1)}x`,
    });

    playSound('achievement');
  };

  return (
    <div className='container mx-auto max-w-6xl select-none px-4 py-8' suppressHydrationWarning>
      {/* Game header */}
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold text-amber-800 dark:text-amber-300'>Cookie Clicker</h1>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setSoundEnabled((prev) => !prev)}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ?
              <Volume2 className='h-5 w-5' />
            : <VolumeX className='h-5 w-5' />}
          </Button>
        </div>
      </div>

      {/* Main game area */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left column - Upgrades */}
        <div className='rounded-lg bg-amber-50 p-4 shadow-md dark:bg-amber-900/50'>
          <h2 className='mb-4 text-xl font-bold text-amber-800 dark:text-amber-300'>Upgrades</h2>

          <Tabs defaultValue='cps' value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='mb-4 grid grid-cols-2'>
              <TabsTrigger value='cps'>Per Second</TabsTrigger>
              <TabsTrigger value='cpc'>Per Click</TabsTrigger>
            </TabsList>

            <TabsContent value='cps' className='space-y-3'>
              {UPGRADES.map((upgrade) => {
                const owned = ownedUpgrades[upgrade.id] || 0;
                const cost = getUpgradeCost(upgrade.id);
                const canAfford = cookies >= cost;

                return (
                  <div key={upgrade.id} className='rounded bg-white p-3 shadow-sm dark:bg-amber-800/30'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>{upgrade.name}</h3>
                        <p className='text-sm text-gray-600 dark:text-amber-200/70'>{upgrade.description}</p>
                        <p className='mt-1 text-xs'>
                          Owned: {owned} | +{(upgrade.cps * prestigeMultiplier).toFixed(1)} CPS
                        </p>
                      </div>
                      <Button
                        onClick={() => purchaseUpgrade(upgrade.id)}
                        disabled={!canAfford}
                        variant={canAfford ? 'default' : 'outline'}
                        className={canAfford ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      >
                        {formatNumber(cost)}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value='cpc' className='space-y-3'>
              {CPC_UPGRADES.map((upgrade) => {
                const owned = ownedCpcUpgrades[upgrade.id] || 0;
                const cost = getCpcUpgradeCost(upgrade.id);
                const canAfford = cookies >= cost;

                return (
                  <div key={upgrade.id} className='rounded bg-white p-3 shadow-sm dark:bg-amber-800/30'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>{upgrade.name}</h3>
                        <p className='text-sm text-gray-600 dark:text-amber-200/70'>{upgrade.description}</p>
                        <p className='mt-1 text-xs'>
                          Owned: {owned} | +{upgrade.cpcBonus.toFixed(1)} per click
                        </p>
                      </div>
                      <Button
                        onClick={() => purchaseCpcUpgrade(upgrade.id)}
                        disabled={!canAfford}
                        variant={canAfford ? 'default' : 'outline'}
                        className={canAfford ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      >
                        {formatNumber(cost)}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        {/* Middle column - Cookie */}
        <div className='flex flex-col items-center'>
          {/* Cookie counter */}
          <div className='mb-4 text-center'>
            <h2 className='text-3xl font-bold text-amber-800 dark:text-amber-300'>{formatNumber(cookies)} Cookies</h2>
            <div className='flex justify-center gap-4 text-gray-600 dark:text-amber-200/70'>
              <p>CPS: {formatNumber(effectiveCPS())}</p>
              {/* <p>per click: {formatNumber(calculateEffectiveCpc())}</p> */}
            </div>
          </div>

          {/* Cookie button */}
          <div className='relative'>
            <button
              onClick={handleCookieClick}
              className='relative h-48 w-48 overflow-hidden rounded-full bg-amber-300 shadow-lg transition-transform hover:bg-amber-400 active:scale-95'
              style={{
                backgroundImage: 'radial-gradient(circle, #f59e0b 30%, #d97706 70%)',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
              }}
            >
              <div className='absolute inset-0 flex items-center justify-center'>
                <div
                  className='h-40 w-40 rounded-full bg-amber-200'
                  style={{
                    backgroundImage: 'radial-gradient(circle, #fbbf24 30%, #f59e0b 70%)',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='absolute h-2 w-2 rounded-full bg-amber-800' style={{ top: '30%', left: '30%' }}></div>
                    <div className='absolute h-2 w-2 rounded-full bg-amber-800' style={{ top: '40%', left: '60%' }}></div>
                    <div className='absolute h-2 w-2 rounded-full bg-amber-800' style={{ top: '60%', left: '40%' }}></div>
                    <div className='absolute h-2 w-2 rounded-full bg-amber-800' style={{ top: '50%', left: '70%' }}></div>
                    <div className='absolute h-2 w-2 rounded-full bg-amber-800' style={{ top: '70%', left: '30%' }}></div>
                  </div>
                </div>
              </div>
            </button>

            {/* Floating text animations */}
            {floatingTexts.map((text) => (
              <div
                key={text.id}
                className='animate-float pointer-events-none absolute font-bold text-amber-800'
                style={{
                  left: `${text.x}px`,
                  top: `${text.y}px`,
                  animation: 'float 1s ease-out forwards',
                  opacity: 1,
                }}
              >
                {text.value}
              </div>
            ))}

            {/* Cursor Ring Animation */}
            {(ownedUpgrades.cursor || 0) > 0 && (
              <div className='pointer-events-none absolute inset-0'>
                {Array.from({ length: Math.min(20, ownedUpgrades.cursor || 0) }).map((_, index) => {
                  // Calculate position in a circle
                  const totalCursors = Math.min(20, ownedUpgrades.cursor || 0);
                  const angleStep = (2 * Math.PI) / totalCursors;
                  const angle = index * angleStep;
                  const radius = 120; // Distance from center

                  // Calculate rotation angle for the cursor
                  const cursorAngle = (angle * 180) / Math.PI + 45; // Add 45 degrees to point inward

                  return (
                    <div
                      key={`cursor-${index}`}
                      className='animate-cursor-orbit absolute -translate-x-1/2 -translate-y-1/2 transform'
                      style={{
                        left: `${50 + Math.cos(angle) * radius * 0.45}%`,
                        top: `${50 + Math.sin(angle) * radius * 0.45}%`,
                        animation: `cursorOrbit 20s linear infinite ${(index / totalCursors) * 20}s`,
                        transform: `translate(-50%, -50%) rotate(${cursorAngle}deg)`,
                        zIndex: 10,
                      }}
                    >
                      <MousePointer
                        className='h-4 w-4 text-amber-800 dark:text-amber-300'
                        style={{
                          filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* CPC Upgrade Visual Effects */}
            {baseCpc > 1 && (
              <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div
                    className={`absolute h-full w-full rounded-full ${calculateEffectiveCpc() >= 5 ? 'animate-pulse-glow' : 'animate-pulse-soft'}`}
                  >
                    {Array.from({ length: Math.min(5, Math.floor((baseCpc - 1) / 2)) }).map((_, index) => (
                      <Sparkles
                        key={`sparkle-${index}`}
                        className='absolute h-5 w-5 text-yellow-300'
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          filter: 'drop-shadow(0 0 3px rgba(255,255,0,0.8))',
                          animation: `sparkle ${1 + Math.random()}s ease-in-out infinite`,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prestige button */}
          {totalCookies >= prestigeCost / 2 && (
            <div className='mt-8 text-center'>
              <Button
                onClick={prestige}
                disabled={cookies < prestigeCost}
                variant={cookies >= prestigeCost ? 'default' : 'outline'}
                className={cookies >= prestigeCost ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <ArrowBigUp className='mr-2 h-4 w-4' />
                Prestige ({formatNumber(prestigeCost)} cookies)
              </Button>
              <p className='mt-1 text-xs text-gray-600 dark:text-amber-200/70'>
                Current multiplier: {prestigeMultiplier.toFixed(1)}x
              </p>
            </div>
          )}
        </div>

        {/* Right column - Powerups & Achievements */}
        <div className='space-y-6'>
          {/* Powerups */}
          <div className='rounded-lg bg-amber-50 p-4 shadow-md dark:bg-amber-900/50'>
            <h2 className='mb-4 text-xl font-bold text-amber-800 dark:text-amber-300'>Powerups</h2>
            <div className='space-y-3'>
              {POWERUPS.map((powerup) => {
                const canAfford = cookies >= powerup.cost;
                const isActive = activePowerups[powerup.id];
                const timeLeft =
                  isActive ? Math.max(0, (isActive.startTime + isActive.duration * 1000 - Date.now()) / 1000).toFixed(1) : 0;

                return (
                  <div key={powerup.id} className='rounded bg-white p-3 shadow-sm dark:bg-amber-800/30'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-medium'>{powerup.name}</h3>
                        <p className='text-sm text-gray-600 dark:text-amber-200/70'>{powerup.description}</p>
                        {isActive && (
                          <p className='mt-1 text-xs text-green-600 dark:text-green-400'>Active: {timeLeft}s remaining</p>
                        )}
                      </div>
                      <Button
                        onClick={() => activatePowerup(powerup.id)}
                        disabled={!canAfford || Boolean(isActive)}
                        variant={canAfford && !isActive ? 'default' : 'outline'}
                        className={canAfford && !isActive ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      >
                        {formatNumber(powerup.cost)}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className='rounded-lg bg-amber-50 p-4 shadow-md dark:bg-amber-900/50'>
            <h2 className='mb-4 text-xl font-bold text-amber-800 dark:text-amber-300'>Achievements</h2>
            <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = unlockedAchievements.includes(achievement.id);

                return (
                  <div
                    key={achievement.id}
                    className={`rounded p-2 text-center ${
                      unlocked ? 'bg-amber-200 dark:bg-amber-700' : 'bg-gray-200 opacity-60 dark:bg-gray-700'
                    }`}
                    title={unlocked ? achievement.description : '???'}
                  >
                    <div className='mb-1 text-2xl'>{unlocked ? achievement.icon : '?'}</div>
                    <div className='text-xs font-medium'>{unlocked ? achievement.name : 'Locked'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx global>
        {`
          @keyframes float {
            0% {
              transform: translateY(0);
              opacity: 1;
            }
            100% {
              transform: translateY(-50px);
              opacity: 0;
            }
          }
          .animate-float {
            animation: float 1s ease-out forwards;
          }
          @keyframes cursorOrbit {
            0% {
              opacity: 0;
              transform: translate(-50%, -50%) rotate(var(--angle)) scale(0.8);
            }
            20% {
              opacity: 1;
              transform: translate(-50%, -50%) rotate(calc(var(--angle) + 10deg)) scale(1);
            }
            80% {
              opacity: 1;
              transform: translate(-50%, -50%) rotate(calc(var(--angle) + 350deg)) scale(1);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%) rotate(calc(var(--angle) + 360deg)) scale(0.8);
            }
          }
          .animate-cursor-orbit {
            animation: cursorOrbit 20s linear infinite;
          }
          @keyframes pulse-soft {
            0% {
              box-shadow: 0 0 5px 0 rgba(255, 204, 0, 0.3);
            }
            50% {
              box-shadow: 0 0 15px 5px rgba(255, 204, 0, 0.5);
            }
            100% {
              box-shadow: 0 0 5px 0 rgba(255, 204, 0, 0.3);
            }
          }
          @keyframes pulse-glow {
            0% {
              box-shadow: 0 0 10px 0 rgba(255, 204, 0, 0.5);
            }
            50% {
              box-shadow: 0 0 30px 10px rgba(255, 204, 0, 0.8);
            }
            100% {
              box-shadow: 0 0 10px 0 rgba(255, 204, 0, 0.5);
            }
          }
          @keyframes sparkle {
            0% {
              opacity: 0;
              transform: scale(0.8) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.2) rotate(180deg);
            }
            100% {
              opacity: 0;
              transform: scale(0.8) rotate(360deg);
            }
          }
          .animate-pulse-soft {
            animation: pulse-soft 2s ease-in-out infinite;
          }
          .animate-pulse-glow {
            animation: pulse-glow 1.5s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
