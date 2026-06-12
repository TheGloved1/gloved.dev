'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMount } from '@/hooks/use-mount';
import { useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Bird } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BirdSelector } from './bird-selector';

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

const DEBUG_SOUND_MENU = false;

export function BirdGame() {
  const { isSignedIn, user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [localHighScore, setLocalHighScore] = useLocalStorage('bird-high-score', 0);
  const [isMuted, setIsMuted] = useLocalStorage('bird-muted', false);
  const [selectedBird, setSelectedBird] = useLocalStorage<BirdType>('selected-bird', 'sparrow');
  const [showBirdSelector, setShowBirdSelector] = useState(false);

  useMount(() => {
    const oldHighScore = localStorage.getItem('kirk-bird-high-score');
    const oldMuted = localStorage.getItem('kirk-bird-muted');
    if (oldHighScore) {
      setLocalHighScore(parseInt(oldHighScore));
      localStorage.removeItem('kirk-bird-high-score');
    }
    if (oldMuted) {
      setIsMuted(oldMuted === 'true');
      localStorage.removeItem('kirk-bird-muted');
    }
  });

  const userBestScore = useQuery(api.leaderboard.getUserBestScore, user?.id ? { userId: user.id } : 'skip');
  const highScore = isSignedIn ? (userBestScore ?? 0) : localHighScore;

  const getDisplayName = useCallback(() => {
    if (!user) return 'Unknown';
    if (user.username) return user.username;
    if (user.fullName) return user.fullName;
    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.split('@')[0];
    }
    return 'Player';
  }, [user]);

  const saveScore = useMutation(api.leaderboard.addEntry);

  const saveScoreMutation = useCallback(
    async (scoreToSave: number) => {
      if (!user?.id) return;
      try {
        const displayName = getDisplayName();
        console.log('Attempting to save score:', scoreToSave, 'for user:', user?.id, displayName);
        await saveScore({ userId: user.id, username: displayName, score: scoreToSave });
        console.log('Score saved successfully!');
      } catch (error) {
        console.error('Failed to save score:', error);
      }
    },
    [user?.id, getDisplayName, saveScore],
  );

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
  const groundOffsetRef = useRef(0);
  const cloudsRef = useRef<Array<{ x: number; y: number; size: number; speed: number; shape: number }>>([
    { x: 100, y: 80, size: 60, speed: 0.3, shape: 0 },
    { x: 300, y: 120, size: 80, speed: 0.2, shape: 1 },
    { x: 550, y: 60, size: 50, speed: 0.25, shape: 2 },
    { x: 700, y: 150, size: 70, speed: 0.35, shape: 3 },
    { x: 900, y: 100, size: 45, speed: 0.18, shape: 1 },
    { x: 1100, y: 130, size: 55, speed: 0.28, shape: 0 },
  ]);

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

  const createExplosion = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#dc2626', '#FF8C00', '#FFD700', '#8B4513', '#FFF'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + Math.random() * 0.8;
      const speed = 1 + Math.random() * 3;

      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        maxLife: 40 + Math.random() * 30,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  const updateParticles = useCallback((ctx: CanvasRenderingContext2D) => {
    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.vy += PARTICLE_GRAVITY;
      particle.vx *= PARTICLE_FRICTION;
      particle.vy *= PARTICLE_FRICTION;

      particle.x += particle.vx;
      particle.y += particle.vy;

      particle.life -= 1 / particle.maxLife;

      if (particle.life > 0) {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        const s = Math.floor(particle.size * particle.life);
        if (s > 0) {
          ctx.fillRect(Math.floor(particle.x - s / 2), Math.floor(particle.y - s / 2), s, s);
        }
        ctx.restore();

        return true;
      }

      return false;
    });
  }, []);

  const applyCollisionPhysics = useCallback((bird: Bird, pipe: Pipe) => {
    const birdCenterX = bird.x + bird.size / 2;
    const birdCenterY = bird.y + bird.size / 2;
    const pipeCenterX = pipe.x + pipe.width / 2;

    const horizontalForce = birdCenterX < pipeCenterX ? -BIRD_HIT_BOUNCE : BIRD_HIT_BOUNCE;
    const verticalForce = -BIRD_HIT_BOUNCE * 0.8;

    bird.hitVelocityX = horizontalForce + (Math.random() - 0.5) * 4;
    bird.hitVelocityY = verticalForce + Math.random() * 2;
    bird.rotationSpeed = (Math.random() - 0.5) * 0.3;
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

  const drawBird = useCallback(
    (ctx: CanvasRenderingContext2D, bird: Bird) => {
      const bx = Math.floor(bird.x);
      const by = Math.floor(bird.y);
      const s = bird.size;

      let primary,
        secondary,
        belly,
        beak,
        eye,
        hasCrest = false,
        hasMask = false,
        wingSpeed = 1;

      switch (selectedBird) {
        case 'sparrow':
          primary = '#8B6914';
          secondary = '#654321';
          belly = '#F4E4C1';
          beak = '#FF8C00';
          eye = '#1F2937';
          break;
        case 'cardinal':
          primary = '#DC143C';
          secondary = '#8B0000';
          belly = '#FFD4A3';
          beak = '#FFA500';
          eye = '#1F2937';
          hasCrest = true;
          hasMask = true;
          break;
        case 'bluejay':
          primary = '#4169E1';
          secondary = '#1E3A8A';
          belly = '#E6F3FF';
          beak = '#4169E1';
          eye = '#1F2937';
          hasCrest = true;
          break;
        case 'hummingbird':
          primary = '#228B22';
          secondary = '#006400';
          belly = '#BBF7D0';
          beak = '#000000';
          eye = '#1F2937';
          wingSpeed = 3;
          break;
        default:
          primary = '#8B6914';
          secondary = '#654321';
          belly = '#F4E4C1';
          beak = '#FF8C00';
          eye = '#1F2937';
      }

      ctx.save();
      ctx.translate(bx + s / 2, by + s / 2);
      ctx.rotate(bird.rotation);
      ctx.translate(-(bx + s / 2), -(by + s / 2));

      ctx.fillStyle = primary;
      ctx.fillRect(bx + 8, by + 12, 24, 24);
      ctx.fillRect(bx + 12, by + 8, 16, 16);

      ctx.fillStyle = belly;
      ctx.fillRect(bx + 16, by + 20, 16, 12);

      if (hasMask) {
        ctx.fillStyle = '#111';
        ctx.fillRect(bx + 20, by + 12, 12, 8);
      }

      if (hasCrest) {
        ctx.fillStyle = primary;
        ctx.fillRect(bx + 16, by + 4, 8, 4);
      }

      ctx.fillStyle = '#FFF';
      ctx.fillRect(bx + 24, by + 12, 4, 4);
      ctx.fillStyle = eye;
      ctx.fillRect(bx + 26, by + 14, 2, 2);

      ctx.fillStyle = beak;
      ctx.fillRect(bx + 32, by + 16, 8, 4);

      const wingY = Math.sin(bird.wingPhase * wingSpeed) * 8;
      ctx.fillStyle = secondary;
      ctx.fillRect(bx + 4, by + 18 + wingY, 12, 8);

      ctx.restore();
    },
    [selectedBird],
  );

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): Pipe | null => {
    if (bird.y <= 0 || bird.y + bird.size >= GAME_HEIGHT) {
      return { x: 0, gapY: 0, width: GAME_WIDTH, gapHeight: 0, passed: false };
    }

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

    ctx.fillStyle = '#4A7CF5';
    ctx.fillRect(0, 0, GAME_WIDTH, 160);
    ctx.fillStyle = '#5C94FC';
    ctx.fillRect(0, 160, GAME_WIDTH, 120);
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 280, GAME_WIDTH, 100);
    ctx.fillStyle = '#B0E0E6';
    ctx.fillRect(0, 380, GAME_WIDTH, GAME_HEIGHT - GROUND_HEIGHT - 380);

    const sunX = GAME_WIDTH - 90;
    const sunY = 70;
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(sunX - 14, sunY - 14, 28, 28);
    ctx.fillRect(sunX - 6, sunY - 22, 12, 8);
    ctx.fillRect(sunX - 6, sunY + 14, 12, 8);
    ctx.fillRect(sunX - 22, sunY - 6, 8, 12);
    ctx.fillRect(sunX + 14, sunY - 6, 8, 12);
    ctx.fillStyle = '#FFEC8B';
    ctx.fillRect(sunX - 18, sunY - 18, 4, 4);
    ctx.fillRect(sunX + 14, sunY - 18, 4, 4);
    ctx.fillRect(sunX - 18, sunY + 14, 4, 4);
    ctx.fillRect(sunX + 14, sunY + 14, 4, 4);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(sunX - 24, sunY - 24, 3, 3);
    ctx.fillRect(sunX + 21, sunY - 24, 3, 3);
    ctx.fillRect(sunX - 24, sunY + 21, 3, 3);
    ctx.fillRect(sunX + 21, sunY + 21, 3, 3);

    if (gameState === 'playing' && !birdRef.current.isDead) {
      mountainOffsetRef.current -= 0.3;
      hillsOffsetRef.current -= 0.6;
      groundOffsetRef.current -= 1.5;

      if (mountainOffsetRef.current <= -GAME_WIDTH) {
        mountainOffsetRef.current += GAME_WIDTH;
      }
      if (hillsOffsetRef.current <= -GAME_WIDTH) {
        hillsOffsetRef.current += GAME_WIDTH;
      }
    }

    ctx.fillStyle = '#4A7A6A';
    const dOffset = Math.floor(mountainOffsetRef.current * 0.5);
    for (let i = 0; i < 5; i++) {
      const baseX = dOffset + i * 240;
      ctx.beginPath();
      ctx.moveTo(baseX - 40, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(baseX + 40, GAME_HEIGHT - GROUND_HEIGHT - 50);
      ctx.lineTo(baseX + 80, GAME_HEIGHT - GROUND_HEIGHT - 30);
      ctx.lineTo(baseX + 120, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.fill();
    }

    ctx.fillStyle = '#3A7A2A';
    const mOffset = Math.floor(mountainOffsetRef.current);
    for (let i = 0; i < 5; i++) {
      const baseX = mOffset + i * 300;
      const peakX = baseX + 45;
      ctx.beginPath();
      ctx.moveTo(baseX, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(baseX + 20, GAME_HEIGHT - GROUND_HEIGHT - 40);
      ctx.lineTo(baseX + 30, GAME_HEIGHT - GROUND_HEIGHT - 55);
      ctx.lineTo(peakX, GAME_HEIGHT - GROUND_HEIGHT - 110);
      ctx.lineTo(baseX + 55, GAME_HEIGHT - GROUND_HEIGHT - 95);
      ctx.lineTo(baseX + 65, GAME_HEIGHT - GROUND_HEIGHT - 105);
      ctx.lineTo(baseX + 75, GAME_HEIGHT - GROUND_HEIGHT - 90);
      ctx.lineTo(baseX + 85, GAME_HEIGHT - GROUND_HEIGHT - 100);
      ctx.lineTo(baseX + 95, GAME_HEIGHT - GROUND_HEIGHT - 85);
      ctx.lineTo(baseX + 110, GAME_HEIGHT - GROUND_HEIGHT - 95);
      ctx.lineTo(baseX + 120, GAME_HEIGHT - GROUND_HEIGHT - 75);
      ctx.lineTo(baseX + 130, GAME_HEIGHT - GROUND_HEIGHT - 85);
      ctx.lineTo(baseX + 145, GAME_HEIGHT - GROUND_HEIGHT - 65);
      ctx.lineTo(baseX + 160, GAME_HEIGHT - GROUND_HEIGHT - 72);
      ctx.lineTo(baseX + 175, GAME_HEIGHT - GROUND_HEIGHT - 55);
      ctx.lineTo(baseX + 190, GAME_HEIGHT - GROUND_HEIGHT - 60);
      ctx.lineTo(baseX + 200, GAME_HEIGHT - GROUND_HEIGHT - 50);
      ctx.lineTo(baseX + 210, GAME_HEIGHT - GROUND_HEIGHT - 45);
      ctx.lineTo(baseX + 230, GAME_HEIGHT - GROUND_HEIGHT - 30);
      ctx.lineTo(baseX + 280, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.fill();

      const peakY = GAME_HEIGHT - GROUND_HEIGHT - 110;
      const treeVariant = i % 3;
      if (treeVariant === 0) {
        ctx.fillStyle = '#2A5A14';
        ctx.fillRect(peakX - 3, peakY - 18, 6, 18);
        ctx.fillStyle = '#1A3A0A';
        ctx.fillRect(peakX - 2, peakY - 14, 4, 4);
        ctx.fillStyle = '#5A3A1A';
        ctx.fillRect(peakX - 1, peakY, 2, 5);
      } else if (treeVariant === 1) {
        ctx.fillStyle = '#3A6A1A';
        ctx.fillRect(peakX - 5, peakY - 14, 10, 14);
        ctx.fillStyle = '#5A9A2A';
        ctx.fillRect(peakX - 3, peakY - 11, 6, 3);
        ctx.fillStyle = '#5A3A1A';
        ctx.fillRect(peakX - 1, peakY, 2, 5);
      } else {
        ctx.fillStyle = '#1A4A0A';
        ctx.fillRect(peakX - 2, peakY - 12, 4, 12);
        ctx.fillRect(peakX + 4, peakY - 10, 4, 10);
        ctx.fillStyle = '#3A7A20';
        ctx.fillRect(peakX, peakY - 6, 2, 2);
      }
    }

    ctx.fillStyle = '#3A9A2A';
    const hOffset = Math.floor(hillsOffsetRef.current);
    for (let i = 0; i < 6; i++) {
      const baseX = hOffset + i * 180;
      ctx.beginPath();
      ctx.moveTo(baseX, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.lineTo(baseX + 60, GAME_HEIGHT - GROUND_HEIGHT - 45);
      ctx.lineTo(baseX + 120, GAME_HEIGHT - GROUND_HEIGHT - 20);
      ctx.lineTo(baseX + 180, GAME_HEIGHT - GROUND_HEIGHT);
      ctx.fill();

      const peakX = baseX + 60;
      const peakY = GAME_HEIGHT - GROUND_HEIGHT - 45;
      const shoulderX = baseX + 30;
      const shoulderY = GAME_HEIGHT - GROUND_HEIGHT - 22;
      const treeType = i % 3;

      if (treeType === 0) {
        ctx.fillStyle = '#2D5A1A';
        ctx.fillRect(peakX - 6, peakY - 22, 12, 22);
        ctx.fillRect(peakX - 4, peakY - 26, 8, 6);
        ctx.fillStyle = '#4A8A2A';
        ctx.fillRect(peakX - 3, peakY - 20, 6, 3);
        ctx.fillRect(peakX - 2, peakY - 14, 4, 3);
      } else if (treeType === 1) {
        ctx.fillStyle = '#2D6B1A';
        ctx.fillRect(peakX - 8, peakY - 20, 16, 20);
        ctx.fillStyle = '#5A9A2A';
        ctx.fillRect(peakX - 6, peakY - 17, 12, 4);
        ctx.fillRect(peakX - 5, peakY - 10, 10, 3);
      } else {
        ctx.fillStyle = '#1A5A0A';
        ctx.fillRect(peakX - 3, peakY - 28, 6, 28);
        ctx.fillRect(peakX - 5, peakY - 22, 10, 6);
        ctx.fillRect(peakX - 4, peakY - 16, 8, 4);
        ctx.fillStyle = '#3A8A1A';
        ctx.fillRect(peakX - 2, peakY - 18, 4, 3);
      }

      ctx.fillStyle = '#5A3A1A';
      ctx.fillRect(peakX - 1, peakY, 2, 6);

      ctx.fillStyle = '#2D5A1A';
      if (i % 2 === 0) {
        ctx.fillRect(shoulderX - 3, shoulderY - 10, 6, 10);
        ctx.fillRect(shoulderX - 4, shoulderY - 14, 8, 6);
      } else {
        ctx.fillRect(shoulderX - 4, shoulderY - 12, 8, 12);
        ctx.fillRect(shoulderX - 2, shoulderY - 8, 4, 3);
      }
      ctx.fillStyle = '#5A3A1A';
      ctx.fillRect(shoulderX - 1, shoulderY, 2, 4);
    }

    const drawCloudShadow = (px: number, py: number, pw: number, ph: number) => {
      ctx.fillStyle = 'rgba(180, 200, 220, 0.3)';
      ctx.fillRect(px + 2, py + 2, pw, ph);
    };
    const drawCloudBody = (px: number, py: number, pw: number, ph: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(px, py, pw, ph);
    };

    cloudsRef.current.forEach((cloud) => {
      cloud.x -= cloud.speed;
      if (cloud.x + cloud.size < 0) cloud.x = GAME_WIDTH + cloud.size;
      const cx = Math.floor(cloud.x);
      const cy = Math.floor(cloud.y);
      const cs = Math.floor(cloud.size);

      switch (cloud.shape) {
        case 0:
          drawCloudShadow(cx, cy, cs, Math.floor(cs * 0.35));
          drawCloudBody(cx, cy, cs, Math.floor(cs * 0.35));
          drawCloudShadow(cx + Math.floor(cs * 0.25), cy - 8, Math.floor(cs * 0.5), 10);
          drawCloudBody(cx + Math.floor(cs * 0.25), cy - 10, Math.floor(cs * 0.5), 12);
          break;
        case 1:
          drawCloudShadow(cx, cy, cs, Math.floor(cs * 0.3));
          drawCloudBody(cx, cy, cs, Math.floor(cs * 0.3));
          drawCloudShadow(cx + Math.floor(cs * 0.1), cy - 8, Math.floor(cs * 0.35), 8);
          drawCloudBody(cx + Math.floor(cs * 0.1), cy - 10, Math.floor(cs * 0.35), 10);
          drawCloudShadow(cx + Math.floor(cs * 0.5), cy - 6, Math.floor(cs * 0.35), 8);
          drawCloudBody(cx + Math.floor(cs * 0.5), cy - 8, Math.floor(cs * 0.35), 10);
          break;
        case 2:
          drawCloudShadow(cx, cy, cs, Math.floor(cs * 0.25));
          drawCloudBody(cx, cy, cs, Math.floor(cs * 0.25));
          drawCloudShadow(cx + Math.floor(cs * 0.3), cy - 4, Math.floor(cs * 0.4), 6);
          drawCloudBody(cx + Math.floor(cs * 0.3), cy - 6, Math.floor(cs * 0.4), 8);
          break;
        case 3:
          drawCloudShadow(cx, cy, Math.floor(cs * 0.7), Math.floor(cs * 0.4));
          drawCloudBody(cx, cy, Math.floor(cs * 0.7), Math.floor(cs * 0.4));
          drawCloudShadow(cx + Math.floor(cs * 0.15), cy - 12, Math.floor(cs * 0.4), 12);
          drawCloudBody(cx + Math.floor(cs * 0.15), cy - 14, Math.floor(cs * 0.4), 14);
          break;
      }
    });

    const gOff = Math.floor(groundOffsetRef.current);
    const scrollX = ((gOff % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;

    for (let x = -GAME_WIDTH; x < GAME_WIDTH * 2; x += GAME_WIDTH) {
      const dx = x + scrollX;

      ctx.fillStyle = '#4A7A2A';
      ctx.fillRect(dx, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, 8);
      ctx.fillStyle = '#3A6A1A';
      ctx.fillRect(dx, GAME_HEIGHT - GROUND_HEIGHT + 8, GAME_WIDTH, 4);

      ctx.fillStyle = '#6B4A2E';
      ctx.fillRect(dx, GAME_HEIGHT - GROUND_HEIGHT + 12, GAME_WIDTH, GROUND_HEIGHT - 12);

      ctx.fillStyle = '#5A3D22';
      ctx.fillRect(dx, GAME_HEIGHT - GROUND_HEIGHT + 40, GAME_WIDTH, GROUND_HEIGHT - 40);
    }

    ctx.fillStyle = '#5A9A3A';
    for (let x = -20; x < GAME_WIDTH + 20; x += 20) {
      const sx = (((x + scrollX) % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;
      const h = 6 + (((x + scrollX) / 4) % 3) * 2;
      ctx.fillRect(sx, GAME_HEIGHT - GROUND_HEIGHT - h, 3, h);
      ctx.fillRect(sx + 10, GAME_HEIGHT - GROUND_HEIGHT - h + 2, 3, h - 2);
    }

    ctx.fillStyle = '#7A5A3E';
    for (let i = 0; i < 25; i++) {
      const dx = (((i * 67 + 13 + scrollX) % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;
      const dy = GAME_HEIGHT - GROUND_HEIGHT + 18 + ((i * 23) % (GROUND_HEIGHT - 25));
      ctx.fillRect(dx, dy, 4, 3);
    }

    ctx.fillStyle = '#8B7355';
    for (let i = 0; i < 10; i++) {
      const px = (((i * 97 + 41 + scrollX) % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;
      const py = GAME_HEIGHT - GROUND_HEIGHT + 14 + ((i * 53) % 30);
      ctx.fillRect(px, py, 5, 3);
    }

    for (let i = 0; i < 5; i++) {
      const fx = (((i * 137 + 53 + scrollX) % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;
      const fy = GAME_HEIGHT - GROUND_HEIGHT + 6;
      ctx.fillStyle = i % 2 === 0 ? '#FFD700' : '#FF69B4';
      ctx.fillRect(fx, fy, 3, 3);
      ctx.fillStyle = '#5A9A3A';
      ctx.fillRect(fx + 1, fy + 3, 1, 4);
    }

    ctx.fillStyle = '#2D6B1A';
    for (let i = 0; i < 5; i++) {
      const bx = (((i * 220 + 40 + scrollX) % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH;
      ctx.fillRect(bx - 10, GAME_HEIGHT - GROUND_HEIGHT - 14, 20, 14);
      ctx.fillRect(bx - 4, GAME_HEIGHT - GROUND_HEIGHT - 20, 10, 8);
      ctx.fillStyle = '#4A9A2A';
      ctx.fillRect(bx - 6, GAME_HEIGHT - GROUND_HEIGHT - 12, 14, 4);
      ctx.fillStyle = '#2D6B1A';
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
      if (!birdRef.current.isDead) {
        birdRef.current.velocity += GRAVITY;
        birdRef.current.wingPhase += WING_FLAP_SPEED;
      } else {
        birdRef.current.velocity += GRAVITY * 2;
        birdRef.current.x += birdRef.current.hitVelocityX;
        birdRef.current.y += birdRef.current.velocity;
        birdRef.current.rotation += birdRef.current.rotationSpeed;
      }
      birdRef.current.y += birdRef.current.velocity;

      if (!birdRef.current.isDead) {
        pipesRef.current = pipesRef.current
          .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter((pipe) => pipe.x + pipe.width > 0);
      }

      pipesRef.current.forEach((pipe) => {
        if (!pipe.passed && pipe.x + pipe.width < birdRef.current.x) {
          pipe.passed = true;
          setScore((prev) => prev + 1);
          playSound('score');
        }
      });

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

      pipesRef.current.forEach((pipe) => {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);

        ctx.fillStyle = '#32CD32';
        ctx.fillRect(pipe.x - 4, pipe.gapY - 12, pipe.width + 8, 12);
        ctx.fillRect(pipe.x - 4, pipe.gapY + pipe.gapHeight, pipe.width + 8, 12);
      });

      drawBird(ctx, birdRef.current);
      updateParticles(ctx);

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 34px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(score.toString(), GAME_WIDTH / 2, 50);

      const hitPipe = checkCollision(birdRef.current, pipesRef.current);
      if (hitPipe && !birdRef.current.isDead) {
        birdRef.current.isDead = true;
        playSound('collision');
        applyCollisionPhysics(birdRef.current, hitPipe);
        createExplosion(birdRef.current.x + birdRef.current.size / 2, birdRef.current.y + birdRef.current.size / 2);
        if (isSignedIn && score > 0) {
          saveScoreMutation(score);
        } else {
          setLocalHighScore(Math.max(localHighScore, score));
        }
      }

      if (birdRef.current.y > GAME_HEIGHT + 100) setGameState('gameOver');
    }

    if (gameState === 'gameOver') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }

    if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
    isSignedIn,
    saveScoreMutation,
    setLocalHighScore,
    localHighScore,
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

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='relative flex h-full w-full max-w-4xl flex-col'>
        <div className='relative flex-1 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-2xl'>
          <div className='relative h-full w-full' style={{ paddingBottom: '75%' }}>
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

        <div className='mt-3 text-center'>
          <div className='inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-4 py-2 backdrop-blur-sm'>
            <span className='text-yellow-400'>🏆</span>
            <span className='text-sm font-semibold text-yellow-300'>High Score: {highScore}</span>
          </div>
        </div>

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
