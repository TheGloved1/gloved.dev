'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { addLeaderboardEntryAction, getUserBestScoreAction } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Bird {
  x: number;
  y: number;
  velocity: number;
  size: number;
}

interface Pipe {
  x: number;
  gapY: number;
  width: number;
  gapHeight: number;
  passed: boolean;
}

const GRAVITY = 0.5;
const JUMP_STRENGTH = -8;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const BIRD_SIZE = 30;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

export function KirkBirdGame() {
  const { isSignedIn, user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameOver'>('start');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useLocalStorage('kirk-bird-high-score', 0);
  const [showSaveScore, setShowSaveScore] = useState(false);

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
      setShowSaveScore(false);
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
    console.log('Sync check:', { isSignedIn, userId: user?.id, highScore, userBestScore });

    if (isSignedIn && user?.id && highScore > 0) {
      const currentBest = userBestScore || 0;
      console.log('Score comparison:', { local: highScore, leaderboard: currentBest });

      if (highScore > currentBest) {
        console.log('Uploading high score to leaderboard:', highScore);
        // Upload local high score to leaderboard if it's higher
        saveScoreMutation.mutate(highScore);
      } else {
        console.log('No upload needed - local score not higher than leaderboard');
      }
    } else {
      console.log('Sync conditions not met:', { isSignedIn, hasUserId: !!user?.id, hasHighScore: highScore > 0 });
    }
  }, [isSignedIn, user?.id, highScore, userBestScore, saveScoreMutation]);

  const birdRef = useRef<Bird>({
    x: 150,
    y: GAME_HEIGHT / 2,
    velocity: 0,
    size: BIRD_SIZE,
  });

  const pipesRef = useRef<Pipe[]>([]);

  const resetGame = useCallback(() => {
    birdRef.current = {
      x: 150,
      y: GAME_HEIGHT / 2,
      velocity: 0,
      size: BIRD_SIZE,
    };
    pipesRef.current = [];
    setScore(0);
    setGameState('start');
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'start') {
      setGameState('playing');
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (gameState === 'playing') {
      birdRef.current.velocity = JUMP_STRENGTH;
    } else if (gameState === 'gameOver') {
      resetGame();
    }
  }, [gameState, resetGame]);

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

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, GAME_HEIGHT - 20, GAME_WIDTH, 20);

    if (gameState === 'playing') {
      // Update bird
      birdRef.current.velocity += GRAVITY;
      birdRef.current.y += birdRef.current.velocity;

      // Update pipes
      pipesRef.current = pipesRef.current.filter((pipe) => pipe.x + PIPE_WIDTH > 0);

      pipesRef.current.forEach((pipe) => {
        pipe.x -= PIPE_SPEED;

        // Check if bird passed the pipe
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdRef.current.x) {
          pipe.passed = true;
          setScore((prev) => prev + 1);
        }
      });

      // Add new pipes
      if (pipesRef.current.length === 0 || pipesRef.current[pipesRef.current.length - 1].x < GAME_WIDTH - 300) {
        const gapY = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
        pipesRef.current.push({
          x: GAME_WIDTH,
          gapY,
          width: PIPE_WIDTH,
          gapHeight: PIPE_GAP,
          passed: false,
        });
      }

      // Check collision
      if (checkCollision(birdRef.current, pipesRef.current)) {
        setGameState('gameOver');
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
    }

    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(
      birdRef.current.x + birdRef.current.size / 2,
      birdRef.current.y + birdRef.current.size / 2,
      birdRef.current.size / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw bird eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
      birdRef.current.x + birdRef.current.size / 2 + 5,
      birdRef.current.y + birdRef.current.size / 2 - 5,
      3,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipesRef.current.forEach((pipe) => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.gapY + pipe.gapHeight, pipe.width, GAME_HEIGHT - pipe.gapY - pipe.gapHeight);
    });

    // Draw score
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(score.toString(), GAME_WIDTH / 2, 80);

    // Draw game state messages
    if (gameState === 'start') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Click or Press Space to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2);

      ctx.font = '24px Arial';
      ctx.fillText('Avoid the pipes!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
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
      ctx.fillText(`High Score: ${highScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);

      // Show user's best score from leaderboard if available
      if (userBestScore !== null && userBestScore !== undefined) {
        ctx.font = '24px Arial';
        ctx.fillText(`Your Best: ${userBestScore}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
      }

      ctx.font = '24px Arial';
      ctx.fillText('Click or Press Space to Play Again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 120);

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
      </div>
    </div>
  );
}
