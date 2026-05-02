'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMount } from '@/hooks/use-mount';
import { addLeaderboardEntryAction, getUserBestScoreAction } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

// Game constants
const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const BIRD_SIZE = 30;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

interface Bird {
  x: number;
  y: number;
  velocity: number;
  size: number;
  isDead: boolean;
}

interface Pipe {
  x: number;
  gapY: number;
  width: number;
  gapHeight: number;
  passed: boolean;
}

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
    refetchInterval: 30000, // Check every 30 seconds
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
  });

  const pipesRef = useRef<Pipe[]>([]);

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

  const resetGame = useCallback(() => {
    birdRef.current = {
      x: 150,
      y: GAME_HEIGHT / 2,
      velocity: 0,
      size: BIRD_SIZE,
      isDead: false,
    };
    pipesRef.current = [];
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

  const checkCollision = useCallback((bird: Bird, pipes: Pipe[]): boolean => {
    // Check ground and ceiling collision
    if (bird.y <= 0 || bird.y + bird.size >= GAME_HEIGHT) {
      return true;
    }

    // Check pipe collision
    for (const pipe of pipes) {
      if (bird.x + bird.size > pipe.x && bird.x < pipe.x + pipe.width) {
        if (bird.y < pipe.gapY || bird.y + bird.size > pipe.gapY + pipe.gapHeight) {
          return true;
        }
      }
    }

    return false;
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#1e3a8a'); // Dark blue
    gradient.addColorStop(1, '#7dd3fc'); // Light blue
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (gameState === 'start') {
      // Draw start screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click or Press Space to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2);

      ctx.font = '24px Arial';
      ctx.fillText('Avoid the pipes!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    }

    if (gameState === 'playing' || gameState === 'gameOver') {
      // Update bird physics
      if (!birdRef.current.isDead) {
        birdRef.current.velocity += GRAVITY;
      } else {
        // Bird falls faster when dead
        birdRef.current.velocity += GRAVITY * 2;
      }
      birdRef.current.y += birdRef.current.velocity;

      // Update pipes (stop when bird is dead)
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

      // Add new pipes (stop when bird is dead)
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
        pipeGradient.addColorStop(0, '#16a34a'); // Green
        pipeGradient.addColorStop(0.5, '#22c55e'); // Light green
        pipeGradient.addColorStop(1, '#16a34a'); // Green

        ctx.fillStyle = pipeGradient;
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);

        // Pipe borders
        ctx.strokeStyle = '#15803d'; // Dark green
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x, 0, pipe.width, pipe.gapY);
        ctx.strokeRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);
      });

      // Draw bird with better styling
      const birdGradient = ctx.createRadialGradient(
        birdRef.current.x + birdRef.current.size / 2,
        birdRef.current.y + birdRef.current.size / 2,
        0,
        birdRef.current.x + birdRef.current.size / 2,
        birdRef.current.y + birdRef.current.size / 2,
        birdRef.current.size / 2,
      );
      birdGradient.addColorStop(0, '#fbbf24'); // Yellow
      birdGradient.addColorStop(1, '#f59e0b'); // Orange

      ctx.fillStyle = birdGradient;
      ctx.beginPath();
      ctx.arc(
        birdRef.current.x + birdRef.current.size / 2,
        birdRef.current.y + birdRef.current.size / 2,
        birdRef.current.size / 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Bird eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(
        birdRef.current.x + birdRef.current.size * 0.7,
        birdRef.current.y + birdRef.current.size * 0.3,
        2,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Draw score with better styling
      ctx.fillStyle = '#000';
      ctx.font = 'bold 34px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeText(`Score: ${score}`, GAME_WIDTH / 2, 50);
      ctx.fillText(`Score: ${score}`, GAME_WIDTH / 2, 50);

      // Check collision
      if (checkCollision(birdRef.current, pipesRef.current) && !birdRef.current.isDead) {
        birdRef.current.isDead = true;
        playSound('collision');
        const newHighScore = Math.max(highScore, score);
        setHighScore(newHighScore);

        // Auto-save to leaderboard if user is signed in and this is a new personal best
        if (isSignedIn && score > 0) {
          console.log('Game over - checking auto-save:', { score, userBestScore });
          // Check if this score beats the user's current best on the leaderboard
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
        // Only play game over sound once when transitioning to gameOver state
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

      // Show auto-save notification for signed-in users
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
  }, [gameState, score, checkCollision, highScore, setHighScore, isSignedIn, userBestScore, saveScoreMutation]);

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
        {/* Game Container */}
        <div className='relative flex-1 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-2xl'>
          <div className='relative h-full w-full' style={{ paddingBottom: '75%' }}>
            {/* Maintain 4:3 aspect ratio (800x600 = 4:3) */}
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
