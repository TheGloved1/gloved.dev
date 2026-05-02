'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMount } from '@/hooks/use-mount';
import { addLeaderboardEntryAction, getUserBestScoreAction } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bird } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BirdSelector } from './bird-selector';

// Game constants
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const BIRD_SIZE = 40;
const WING_FLAP_SPEED = 0.15;
const PARTICLE_COUNT = 30;
const PARTICLE_GRAVITY = 0.3;
const PARTICLE_FRICTION = 0.95;
const BIRD_ROTATION_FRICTION = 0.95;
const BIRD_HIT_BOUNCE = 8;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const GROUND_HEIGHT = 80;

interface Bird {
  x: number;
  y: number;
  velocity: number;
  size: number;
  isDead: boolean;
  wingPhase: number;
  rotation: number;
  rotationSpeed: number;
  hitVelocityX: number;
  hitVelocityY: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Pipe {
  x: number;
  gapY: number;
  width: number;
  gapHeight: number;
  passed: boolean;
}

type BirdType = 'sparrow' | 'cardinal' | 'bluejay' | 'hummingbird';

// Debug flag - set to true to enable sound debug menu
const DEBUG_SOUND_MENU = false;

export function BirdGame() {
  const { isSignedIn, user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('bird-high-score', 0);
  const [isMuted, setIsMuted] = useLocalStorage('bird-muted', false);
  const [selectedBird, setSelectedBird] = useLocalStorage<BirdType>('selected-bird', 'sparrow');
  const [showBirdSelector, setShowBirdSelector] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  // Migrate old localStorage keys to new ones
  useMount(() => {
    const oldHighScore = localStorage.getItem('kirk-bird-high-score');
    const oldMuted = localStorage.getItem('kirk-bird-muted');
    if (oldHighScore) {
      setHighScore(parseInt(oldHighScore));
      localStorage.removeItem('kirk-bird-high-score');
    }
    if (oldMuted) {
      setIsMuted(oldMuted === 'true');
      localStorage.removeItem('kirk-bird-muted');
    }
  });

  // Get user's best score from leaderboard
  const { data: userBestScore } = useQuery({
    queryKey: ['user-best-score', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await getUserBestScoreAction(user.id);
    },
    enabled: !!user?.id,
    refetchInterval: isFocused ? 5000 : false, // Only refetch when focused
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
    staleTime: 5000, // Cache for 5 seconds
  });

  // Get display name for user (fallback to email if username not available)
  const getDisplayName = useCallback(() => {
    if (!user) return 'Unknown';

    // Try username first, then full name, then email
    if (user.username) return user.username;
    if (user.fullName) return user.fullName;
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split('@')[0];
    }

    return 'Player';
  }, [user]);

  // Mutation to save score to leaderboard
  const saveScoreMutation = useMutation({
    mutationFn: async (scoreToSave: number) => {
      const displayName = getDisplayName();
      console.log('Attempting to save score:', scoreToSave, 'for user:', user?.id, displayName);
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      await addLeaderboardEntryAction(user.id, displayName, scoreToSave);
      console.log('Score saved successfully!');

      // Trigger immediate leaderboard refresh across all components
      window.dispatchEvent(new CustomEvent('leaderboard-updated'));
    },
    onSuccess: () => {
      console.log('Score upload successful!');
      // You could show a success message here
    },
    onError: (error) => {
      console.error('Failed to save score:', error);
      // You could show an error message here
    },
  });

  // Sync local high score with leaderboard
  useEffect(() => {
    if (isSignedIn && user?.id && highScore > 0) {
      const currentBest = userBestScore || 0;
      if (highScore > currentBest) {
        // Upload local high score to leaderboard if it's higher
        saveScoreMutation.mutate(highScore);
      }
    }
  }, [isSignedIn, user?.id, highScore, userBestScore, saveScoreMutation]);

  const birdRef = useRef<Bird>({
    x: 150,
    y: GAME_HEIGHT / 2,
    velocity: 0,
    size: BIRD_SIZE,
    isDead: false,
    wingPhase: 0,
    rotation: 0,
    rotationSpeed: 0,
    hitVelocityX: 0,
    hitVelocityY: 0,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mountainOffsetRef = useRef(0);
  const hillsOffsetRef = useRef(0);
  const cloudsRef = useRef<Array<{ x: number; y: number; size: number; speed: number }>>([
    { x: 100, y: 80, size: 60, speed: 0.3 },
    { x: 300, y: 120, size: 80, speed: 0.2 },
    { x: 550, y: 60, size: 50, speed: 0.25 },
    { x: 700, y: 150, size: 70, speed: 0.35 },
  ]);

  // Audio system
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback(
    (type: 'jump' | 'score' | 'collision' | 'gameOver') => {
      if (isMuted) return;

      const audioContext = initAudioContext();
      if (!audioContext) return;

      try {
        const audio = new Audio();

        switch (type) {
          case 'jump':
            audio.src = '/bird/jump.wav';
            break;
          case 'score':
            audio.src = '/bird/score.wav';
            break;
          case 'collision':
            audio.src = '/bird/collision.wav';
            break;
          case 'gameOver':
            audio.src = '/bird/gameOver.wav';
            break;
        }

        audio.volume = 0.25;
        audio.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    },
    [isMuted, initAudioContext],
  );

  // Create explosion particles
  const createExplosion = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#ef4444', '#f87171'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.8;
      const speed = 1 + Math.random() * 3;

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // Upward burst
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: 40 + Math.random() * 30,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  // Update and draw particles
  const updateParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter((particle) => {
      // Update physics
      particle.vy += PARTICLE_GRAVITY;
      particle.vx *= PARTICLE_FRICTION;
      particle.vy *= PARTICLE_FRICTION;

      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update life
      particle.life -= 1 / particle.maxLife;

      // Draw particle
      if (particle.life > 0) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        ctx.fill();

        // Add blood splatter effect
        if (particle.life > 0.7) {
          ctx.globalAlpha = particle.life * 0.3;
          ctx.beginPath();
          ctx.arc(
            particle.x + Math.random() * 4 - 2,
            particle.y + Math.random() * 4 - 2,
            particle.size * particle.life * 0.5,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();

        return true;
      }

      return false;
    });
  }, []);

  // Apply collision physics to bird
  const applyCollisionPhysics = useCallback((bird: Bird, pipe: Pipe) => {
    // Determine collision side and apply appropriate force
    const birdCenterX = bird.x + bird.size / 2;
    const birdCenterY = bird.y + bird.size / 2;
    const pipeCenterX = pipe.x + pipe.width / 2;

    // Calculate collision response
    const horizontalForce = birdCenterX < pipeCenterX ? -BIRD_HIT_BOUNCE : BIRD_HIT_BOUNCE;
    const verticalForce = -BIRD_HIT_BOUNCE * 0.8; // Slight upward bounce

    bird.hitVelocityX = horizontalForce + (Math.random() - 0.5) * 4; // Add randomness
    bird.hitVelocityY = verticalForce + Math.random() * 2;
    bird.rotationSpeed = (Math.random() - 0.5) * 0.3; // Random tumbling
  }, []);

  const resetGame = useCallback(() => {
    birdRef.current = {
      x: 150,
      y: GAME_HEIGHT / 2,
      velocity: 0,
      size: BIRD_SIZE,
      isDead: false,
      wingPhase: 0,
      rotation: 0,
      rotationSpeed: 0,
      hitVelocityX: 0,
      hitVelocityY: 0,
    };
    pipesRef.current = [];
    particlesRef.current = [];
    setScore(0);
    setGameState('start');
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'start') {
      setGameState('playing');
      birdRef.current.velocity = JUMP_STRENGTH;
      playSound('jump');
    } else if (gameState === 'playing' && !birdRef.current.isDead) {
      birdRef.current.velocity = JUMP_STRENGTH;
      playSound('jump');
    } else if (gameState === 'gameOver') {
      resetGame();
    }
  }, [gameState, resetGame, playSound]);

  // Enhanced bird drawing function with different bird types
  const drawBird = useCallback(
    (ctx: CanvasRenderingContext2D, bird: Bird) => {
      const centerX = bird.x + bird.size / 2;
      const centerY = bird.y + bird.size / 2;

      // Calculate wing angle based on flapping phase
      const wingAngle = Math.sin(bird.wingPhase) * 0.4;

      // Apply rotation transformation
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(bird.rotation);
      ctx.translate(-centerX, -centerY);

      // Bird-specific colors and features
      let bodyColors, beakColor, wingSpeedMultiplier, birdFeatures;

      switch (selectedBird) {
        case 'sparrow':
          bodyColors = {
            primary: '#8b6914',
            secondary: '#fbbf24',
            outline: '#654321',
            belly: '#f4e4c1',
          };
          beakColor = '#ff8c00';
          wingSpeedMultiplier = 1;
          birdFeatures = { hasCrest: false, hasMask: false, hasWingBars: false };
          break;

        case 'cardinal':
          bodyColors = {
            primary: '#dc143c',
            secondary: '#ff6b6b',
            outline: '#8b0000',
            belly: '#ffd4a3',
          };
          beakColor = '#ffa500';
          wingSpeedMultiplier = 1.1;
          birdFeatures = { hasCrest: true, hasMask: true, hasWingBars: false };
          break;

        case 'bluejay':
          bodyColors = {
            primary: '#4169e1',
            secondary: '#60a5fa',
            outline: '#1e3a8a',
            belly: '#e6f3ff',
          };
          beakColor = '#4169e1';
          wingSpeedMultiplier = 1.2;
          birdFeatures = { hasCrest: true, hasMask: false, hasWingBars: true };
          break;

        case 'hummingbird':
          bodyColors = {
            primary: '#228b22',
            secondary: '#4ade80',
            outline: '#006400',
            belly: '#bbf7d0',
          };
          beakColor = '#000000';
          wingSpeedMultiplier = 3; // Much faster wing beat
          birdFeatures = { hasCrest: false, hasMask: false, hasWingBars: false };
          break;

        default:
          bodyColors = {
            primary: '#8b6914',
            secondary: '#fbbf24',
            outline: '#654321',
            belly: '#f4e4c1',
          };
          beakColor = '#ff8c00';
          wingSpeedMultiplier = 1;
          birdFeatures = { hasCrest: false, hasMask: false, hasWingBars: false };
      }

      // Adjust wing phase for different birds
      const adjustedWingPhase = bird.wingPhase * wingSpeedMultiplier;
      const adjustedWingAngle = Math.sin(adjustedWingPhase) * 0.4;

      // Draw bird body
      const bodyGradient = ctx.createRadialGradient(
        centerX - bird.size * 0.1,
        centerY - bird.size * 0.1,
        0,
        centerX,
        centerY,
        bird.size * 0.55,
      );
      bodyGradient.addColorStop(0, bodyColors.secondary);
      bodyGradient.addColorStop(0.4, bodyColors.primary);
      bodyGradient.addColorStop(0.8, bodyColors.primary);
      bodyGradient.addColorStop(1, bodyColors.outline);

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      // Egg shape - wider at bottom, tapered at top
      ctx.ellipse(centerX, centerY, bird.size * 0.5, bird.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body outline
      ctx.strokeStyle = bodyColors.outline;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw belly highlight
      const bellyGradient = ctx.createRadialGradient(
        centerX,
        centerY + bird.size * 0.15,
        0,
        centerX,
        centerY + bird.size * 0.2,
        bird.size * 0.3,
      );
      bellyGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      bellyGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = bellyGradient;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + bird.size * 0.15, bird.size * 0.3, bird.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw wings with enhanced animation
      const shoulderY = centerY - bird.size * 0.08;
      const flapPhase = Math.sin(adjustedWingPhase);
      const isFlappingDown = flapPhase > 0;

      // Left wing (behind body)
      ctx.save();
      ctx.translate(centerX - bird.size * 0.08, shoulderY);
      ctx.rotate(-adjustedWingAngle);

      const leftWingGradient = ctx.createLinearGradient(0, 0, -bird.size * 0.4, 0);
      leftWingGradient.addColorStop(0, bodyColors.primary);
      leftWingGradient.addColorStop(0.5, bodyColors.secondary);
      leftWingGradient.addColorStop(1, bodyColors.outline);
      ctx.fillStyle = leftWingGradient;

      ctx.beginPath();
      ctx.moveTo(0, 0);

      if (isFlappingDown) {
        const extension = flapPhase * 0.3;
        ctx.quadraticCurveTo(-bird.size * 0.1, -bird.size * 0.3, -bird.size * 0.7 + extension, -bird.size * 0.2);
        ctx.quadraticCurveTo(-bird.size * 0.8, -bird.size * 0.1, -bird.size * 1.1 + extension, bird.size * 0.2);
        ctx.quadraticCurveTo(-bird.size * 0.2, bird.size * 0.2, 0, 0);
      } else {
        const fold = Math.abs(flapPhase) * 0.2;
        ctx.quadraticCurveTo(-bird.size * 0.05, -bird.size * 0.25, -bird.size * 0.5 - fold, -bird.size * 0.15);
        ctx.quadraticCurveTo(-bird.size * 0.6, -bird.size * 0.05, -bird.size * 0.8 - fold, bird.size * 0.1);
        ctx.quadraticCurveTo(-bird.size * 0.2, bird.size * 0.2, 0, 0);
      }
      ctx.closePath();
      ctx.fill();

      // Add wing bars for bluejay
      if (birdFeatures.hasWingBars) {
        ctx.fillStyle = 'white';
        ctx.fillRect(-bird.size * 0.6, -bird.size * 0.1, bird.size * 0.3, bird.size * 0.05);
      }

      ctx.restore();

      // Right wing (in front of body)
      ctx.save();
      ctx.translate(centerX + bird.size * 0.08, shoulderY);
      ctx.rotate(adjustedWingAngle);

      const rightWingGradient = ctx.createLinearGradient(0, 0, bird.size * 0.4, 0);
      rightWingGradient.addColorStop(0, bodyColors.primary);
      rightWingGradient.addColorStop(0.5, bodyColors.secondary);
      rightWingGradient.addColorStop(1, bodyColors.outline);
      ctx.fillStyle = rightWingGradient;

      ctx.beginPath();
      ctx.moveTo(0, 0);

      if (isFlappingDown) {
        const extension = flapPhase * 0.3;
        ctx.quadraticCurveTo(bird.size * 0.1, -bird.size * 0.3, bird.size * 0.7 + extension, -bird.size * 0.2);
        ctx.quadraticCurveTo(bird.size * 0.8, -bird.size * 0.1, bird.size * 1.1 + extension, bird.size * 0.2);
        ctx.quadraticCurveTo(bird.size * 0.2, bird.size * 0.2, 0, 0);
      } else {
        const fold = Math.abs(flapPhase) * 0.2;
        ctx.quadraticCurveTo(bird.size * 0.05, -bird.size * 0.25, bird.size * 0.5 - fold, -bird.size * 0.15);
        ctx.quadraticCurveTo(bird.size * 0.6, -bird.size * 0.05, bird.size * 0.8 - fold, bird.size * 0.1);
        ctx.quadraticCurveTo(bird.size * 0.2, bird.size * 0.2, 0, 0);
      }
      ctx.closePath();
      ctx.fill();

      // Add wing bars for bluejay
      if (birdFeatures.hasWingBars) {
        ctx.fillStyle = 'white';
        ctx.fillRect(bird.size * 0.3, -bird.size * 0.1, bird.size * 0.3, bird.size * 0.05);
      }

      ctx.restore();

      // Draw beak
      const beakGradient = ctx.createLinearGradient(
        centerX + bird.size * 0.35,
        centerY - bird.size * 0.05,
        centerX + bird.size * 0.65,
        centerY,
      );
      beakGradient.addColorStop(0, beakColor);
      beakGradient.addColorStop(1, beakColor);
      ctx.fillStyle = beakGradient;
      ctx.beginPath();
      ctx.moveTo(centerX + bird.size * 0.35, centerY - bird.size * 0.05);
      ctx.lineTo(centerX + bird.size * 0.65, centerY - bird.size * 0.02);
      ctx.lineTo(centerX + bird.size * 0.65, centerY + bird.size * 0.08);
      ctx.lineTo(centerX + bird.size * 0.35, centerY + bird.size * 0.05);
      ctx.closePath();
      ctx.fill();

      // Beak highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(centerX + bird.size * 0.4, centerY - bird.size * 0.02);
      ctx.lineTo(centerX + bird.size * 0.55, centerY);
      ctx.lineTo(centerX + bird.size * 0.5, centerY + bird.size * 0.02);
      ctx.lineTo(centerX + bird.size * 0.38, centerY);
      ctx.closePath();
      ctx.fill();

      // Draw eye
      const eyeX = centerX + bird.size * 0.12;
      const eyeY = centerY - bird.size * 0.12;
      const eyeRadius = bird.size * 0.1;

      // Eye white
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      // Eye outline
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Eye pupil
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(eyeX + eyeRadius * 0.2, eyeY, eyeRadius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Eye highlight
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(eyeX - eyeRadius * 0.2, eyeY - eyeRadius * 0.3, eyeRadius * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Small second highlight
      ctx.beginPath();
      ctx.arc(eyeX + eyeRadius * 0.3, eyeY + eyeRadius * 0.2, eyeRadius * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Draw crest for cardinal and bluejay
      if (birdFeatures.hasCrest) {
        ctx.fillStyle = bodyColors.primary;
        ctx.beginPath();
        ctx.moveTo(centerX - bird.size * 0.05, centerY - bird.size * 0.4);
        ctx.lineTo(centerX + bird.size * 0.05, centerY - bird.size * 0.5);
        ctx.lineTo(centerX + bird.size * 0.1, centerY - bird.size * 0.38);
        ctx.closePath();
        ctx.fill();
      }

      // Draw mask for cardinal
      if (birdFeatures.hasMask) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX + bird.size * 0.12, centerY - bird.size * 0.12, bird.size * 0.08, 0, Math.PI * 2);
        ctx.fill();
      }

      // Restore rotation transformation
      ctx.restore();
    },
    [selectedBird],
  );

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): Pipe | null => {
    // Check ground and ceiling collision
    if (bird.y <= 0 || bird.y + bird.size >= GAME_HEIGHT) {
      return { x: 0, gapY: 0, width: GAME_WIDTH, gapHeight: 0, passed: false };
    }

    // Check pipe collision
    for (const pipe of pipes) {
      if (bird.x + bird.size > pipe.x && bird.x < pipe.x + pipe.width) {
        if (bird.y < pipe.gapY || bird.y + bird.size > pipe.gapY + pipe.gapHeight) {
          return pipe;
        }
      }
    }

    return null;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT - GROUND_HEIGHT);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.3, '#1e3a8a');
    gradient.addColorStop(0.7, '#60a5fa');
    gradient.addColorStop(1, '#dbeafe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);

    // Draw sun
    const sunX = GAME_WIDTH - 100;
    const sunY = 80;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 40);
    sunGradient.addColorStop(0, '#fef3c7');
    sunGradient.addColorStop(0.5, '#fbbf24');
    sunGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw sun rays
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * 50, sunY + Math.sin(angle) * 50);
      ctx.lineTo(sunX + Math.cos(angle) * 70, sunY + Math.sin(angle) * 70);
      ctx.stroke();
    }

    // Update parallax offsets
    if (gameState === 'playing' && !birdRef.current.isDead) {
      mountainOffsetRef.current -= 0.3;
      hillsOffsetRef.current -= 0.6;

      if (mountainOffsetRef.current <= -GAME_WIDTH) {
        mountainOffsetRef.current += GAME_WIDTH;
      }
      if (hillsOffsetRef.current <= -GAME_WIDTH) {
        hillsOffsetRef.current += GAME_WIDTH;
      }
    }

    // Draw distant mountains
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    const mOffset = mountainOffsetRef.current;
    ctx.moveTo(0, GAME_HEIGHT - GROUND_HEIGHT);
    for (let x = 0; x <= GAME_WIDTH + 100; x += 50) {
      const worldX = x - mOffset;
      const height = 100 + Math.sin(worldX * 0.00785) * 60 + Math.sin(worldX * 0.0157) * 30;
      ctx.lineTo(x, GAME_HEIGHT - GROUND_HEIGHT - height);
    }
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Draw closer hills
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    const hOffset = hillsOffsetRef.current;
    ctx.moveTo(0, GAME_HEIGHT - GROUND_HEIGHT);
    for (let x = 0; x <= GAME_WIDTH + 100; x += 30) {
      const worldX = x - hOffset;
      const height = 50 + Math.sin(worldX * 0.0157) * 40 + Math.sin(worldX * 0.0393) * 20;
      ctx.lineTo(x, GAME_HEIGHT - GROUND_HEIGHT - height);
    }
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Draw moving clouds
    cloudsRef.current.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.size < 0) {
        cloud.x = GAME_WIDTH + cloud.size;
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.3, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
      ctx.arc(cloud.x - cloud.size * 0.3, cloud.y, cloud.size * 0.4, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.size * 0.1, cloud.y - cloud.size * 0.2, cloud.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ground with gradient
    const groundGradient = ctx.createLinearGradient(0, GAME_HEIGHT - GROUND_HEIGHT, 0, GAME_HEIGHT);
    groundGradient.addColorStop(0, '#166534');
    groundGradient.addColorStop(0.5, '#15803d');
    groundGradient.addColorStop(1, '#14532d');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT);

    // Draw grass on top of ground
    ctx.fillStyle = '#22c55e';
    for (let x = 0; x < GAME_WIDTH; x += 15) {
      const grassHeight = 8 + Math.random() * 8;
      ctx.fillRect(x, GAME_HEIGHT - GROUND_HEIGHT - grassHeight, 3, grassHeight);
    }

    // Draw ground details
    for (let i = 0; i < 15; i++) {
      const x = (i * 53) % GAME_WIDTH;
      const y = GAME_HEIGHT - GROUND_HEIGHT + 20 + ((i * 17) % 50);
      if (i % 3 === 0) {
        ctx.fillStyle = ['#f472b6', '#fbbf24', '#c084fc'][i % 3];
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (i % 4 === 0) {
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.ellipse(x, y, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (gameState === 'start') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click or Press Space to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2);

      ctx.font = '24px Arial';
      ctx.fillText('Choose your bird and avoid the pipes!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    }

    if (gameState === 'playing' || gameState === 'gameOver') {
      // Update bird physics and animation
      if (!birdRef.current.isDead) {
        birdRef.current.velocity += GRAVITY;
        birdRef.current.wingPhase += WING_FLAP_SPEED;
      } else {
        birdRef.current.velocity += GRAVITY * 2;
        birdRef.current.wingPhase += WING_FLAP_SPEED * 0.2;

        birdRef.current.x += birdRef.current.hitVelocityX;
        birdRef.current.y += birdRef.current.hitVelocityY;
        birdRef.current.rotation += birdRef.current.rotationSpeed;

        birdRef.current.hitVelocityX *= 0.95;
        birdRef.current.hitVelocityY *= 0.95;
        birdRef.current.rotationSpeed *= BIRD_ROTATION_FRICTION;
      }
      birdRef.current.y += birdRef.current.velocity;

      // Update pipes
      if (!birdRef.current.isDead) {
        pipesRef.current = pipesRef.current
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x + pipe.width > 0);
      }

      // Check for scoring
      pipesRef.current.forEach((pipe) => {
        if (!pipe.passed && pipe.x + pipe.width < birdRef.current.x) {
          pipe.passed = true;
          setScore((prev) => prev + 1);
          playSound('score');
        }
      });

      // Add new pipes
      if (
        !birdRef.current.isDead &&
        (pipesRef.current.length === 0 || pipesRef.current[pipesRef.current.length - 1].x < GAME_WIDTH - 300)
      ) {
        const gapY = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
        pipesRef.current.push({
          x: GAME_WIDTH,
          gapY,
          width: PIPE_WIDTH,
          gapHeight: PIPE_GAP,
          passed: false,
        });
      }

      // Draw pipes with gradient
      pipesRef.current.forEach((pipe) => {
        const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        pipeGradient.addColorStop(0, '#16a34a');
        pipeGradient.addColorStop(0.5, '#22c55e');
        pipeGradient.addColorStop(1, '#16a34a');

        ctx.fillStyle = pipeGradient;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);

        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);
      });

      // Draw enhanced bird
      drawBird(ctx, birdRef.current);

      // Update and draw particles
      updateParticles(ctx);

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = 'bold 34px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeText(`Score: ${score}`, GAME_WIDTH / 2, 50);
      ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, 50);

      // Check collision
      const hitPipe = checkCollision(birdRef.current, pipesRef.current);
      if (hitPipe && !birdRef.current.isDead) {
        birdRef.current.isDead = true;
        playSound('collision');

        applyCollisionPhysics(birdRef.current, hitPipe);
        createExplosion(birdRef.current.x + birdRef.current.size / 2, birdRef.current.y + birdRef.current.size / 2);

        const newHighScore = Math.max(highScore, score);
        setHighScore(newHighScore);

        if (isSignedIn && score > 0) {
          console.log('Game over - checking auto-save:', { score, userBestScore });
          const currentBest = userBestScore || 0;
          if (score > currentBest) {
            console.log('Auto-saving new best score:', score);
            saveScoreMutation.mutate(score);
          } else {
            console.log('Not auto-saving - score not better than best');
          }
        }
      }

      // Set game over when bird falls off screen
      if (birdRef.current.y > GAME_HEIGHT + 100) {
        setGameState('gameOver');
        if (gameState !== 'gameOver') {
          playSound('gameOver');
        }
      }
    }

    if (gameState === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);

      ctx.font = '32px Arial';
      ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);

      ctx.font = '24px Arial';
      ctx.fillText('Click or Press Space to Play Again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60);

      if (isSignedIn && score > 0) {
        const currentBest = userBestScore || 0;
        if (score > currentBest) {
          ctx.fillStyle = '#4CAF50';
          ctx.font = '18px Arial';
          ctx.fillText('🎉 New Personal Best - Auto-Saved!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140);
        }
      }
    }

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    // eslint-disable-next-line react-hooks/immutability
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState,
    drawBird,
    updateParticles,
    score,
    checkCollision,
    playSound,
    applyCollisionPhysics,
    createExplosion,
    highScore,
    setHighScore,
    isSignedIn,
    userBestScore,
    saveScoreMutation,
  ]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    const animate = () => {
      gameLoop();
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleFocus = () => setIsFocused(true);
      const handleBlur = () => setIsFocused(false);
      const handleVisibilityChange = () => setIsFocused(!document.hidden);

      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='relative flex h-full w-full max-w-4xl flex-col'>
        {/* Game Container */}
        <div className='relative flex-1 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-2xl'>
          <div className='relative h-full w-full' style={{ paddingBottom: '75%' }}>
            {/* Bird Change Button - Bottom Left Corner */}
            <div className='absolute bottom-4 left-4 z-10'>
              <Popover open={showBirdSelector} onOpenChange={setShowBirdSelector}>
                <PopoverTrigger asChild>
                  <Button className='flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white/20'>
                    <span className='text-lg'>
                      <Bird className='h-5 w-5' />
                    </span>
                    <span className='text-xs font-medium'>Change Bird</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-fit' align='start' side='top'>
                  <BirdSelector
                    currentBird={selectedBird}
                    onBirdChange={(birdType) => {
                      setSelectedBird(birdType);
                      setShowBirdSelector(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className='absolute inset-0 h-full w-full cursor-pointer rounded-xl border-2 border-slate-600'
              onClick={jump}
              style={{
                imageRendering: 'pixelated',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        </div>

        {/* High Score Display */}
        <div className='mt-3 text-center'>
          <div className='inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-4 py-2 backdrop-blur-sm'>
            <span className='text-yellow-400'>🏆</span>
            <span className='text-sm font-semibold text-yellow-300'>High Score: {highScore}</span>
          </div>
        </div>

        {/* Game Controls */}
        <div className='mt-4 flex justify-center gap-4'>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className='flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20'
          >
            {isMuted ?
              <>
                <span className='text-lg'>🔇</span>
                <span className='text-sm font-medium'>Sound Off</span>
              </>
            : <>
                <span className='text-lg'>🔊</span>
                <span className='text-sm font-medium'>Sound On</span>
              </>
            }
          </button>
        </div>

        {/* Debug Sound Menu */}
        {DEBUG_SOUND_MENU && (
          <div className='mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4'>
            <h3 className='mb-3 text-sm font-bold text-red-300'>🔧 Sound Debug Menu</h3>
            <div className='grid grid-cols-2 gap-2'>
              <button
                onClick={() => playSound('jump')}
                className='rounded border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30'
              >
                🐦 Jump
              </button>
              <button
                onClick={() => playSound('score')}
                className='rounded border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30'
              >
                🎯 Score
              </button>
              <button
                onClick={() => playSound('collision')}
                className='rounded border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30'
              >
                💥 Collision
              </button>
              <button
                onClick={() => playSound('gameOver')}
                className='rounded border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs text-red-300 hover:bg-red-500/30'
              >
                🎮 Game Over
              </button>
            </div>
            <p className='mt-2 text-xs text-red-400'>Set DEBUG_SOUND_MENU = false to hide this menu</p>
          </div>
        )}
      </div>
    </div>
  );
}
