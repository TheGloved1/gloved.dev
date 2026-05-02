'use client';

import { getLeaderboardAction } from '@/lib/actions';
import { SignInButton, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Crown, Medal, Trophy, User } from 'lucide-react';
import { useEffect } from 'react';

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  timestamp: number;
}

export function Leaderboard() {
  const { isSignedIn, user } = useUser();

  const {
    data: leaderboard = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const result = await getLeaderboardAction();
      return result as LeaderboardEntry[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
  });

  // Listen for leaderboard update events
  useEffect(() => {
    const handleLeaderboardUpdate = () => {
      console.log('Leaderboard update event received, refreshing...');
      refetch();
    };

    window.addEventListener('leaderboard-updated', handleLeaderboardUpdate);
    return () => window.removeEventListener('leaderboard-updated', handleLeaderboardUpdate);
  }, [refetch]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className='h-6 w-6 text-yellow-400' />;
      case 2:
        return <Medal className='h-6 w-6 text-gray-300' />;
      case 3:
        return <Medal className='h-6 w-6 text-orange-600' />;
      default:
        return <span className='flex h-6 w-6 items-center justify-center text-sm font-bold text-slate-300'>#{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 ring-2 ring-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/50 ring-2 ring-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/50 ring-2 ring-orange-500/30';
      default:
        return 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70';
    }
  };

  if (error) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-lg'>
        <div className='mb-4 flex items-center gap-2'>
          <Trophy className='h-6 w-6 text-yellow-500' />
          <h2 className='text-2xl font-bold text-gray-800'>Leaderboard</h2>
        </div>
        <p className='text-red-500'>Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-4 shadow-2xl'>
      <div className='mb-3 flex flex-shrink-0 items-center gap-2'>
        <div className='rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 p-1'>
          <Trophy className='h-4 w-4 text-white' />
        </div>
        <h2 className='text-lg font-bold text-white'>Leaderboard</h2>
      </div>

      {isLoading ?
        <div className='flex-1 space-y-2 overflow-y-auto'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='flex animate-pulse items-center gap-3 rounded border border-slate-600 bg-slate-700/50 p-2'
            >
              <div className='h-6 w-6 rounded-full bg-slate-600' />
              <div className='flex-1'>
                <div className='mb-1 h-3 w-3/4 rounded bg-slate-600' />
                <div className='h-2 w-1/2 rounded bg-slate-600' />
              </div>
              <div className='h-4 w-12 rounded bg-slate-600' />
            </div>
          ))}
        </div>
      : <div className='space-y-2'>
          {leaderboard.length === 0 ?
            <p className='py-4 text-center text-sm text-slate-400'>No scores yet. Be the first to play!</p>
          : <div className='flex-1 overflow-y-auto'>
              {leaderboard.slice(0, 8).map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = isSignedIn && user?.id === entry.userId;

                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 p-2 ${getRankBackground(rank)} ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  >
                    <div className='flex w-6 items-center justify-center text-sm'>{getRankIcon(rank)}</div>

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-1'>
                        <p className='truncate text-sm font-semibold text-white'>{entry.username}</p>
                        {isCurrentUser && (
                          <span className='rounded-full bg-blue-500 px-1 py-0.5 text-xs text-white'>You</span>
                        )}
                      </div>
                      <p className='text-xs text-slate-400'>{new Date(entry.timestamp).toLocaleDateString()}</p>
                    </div>

                    <div className='text-right'>
                      <p className='text-sm font-bold text-white'>{entry.score}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          }
        </div>
      }

      {leaderboard.length > 10 && (
        <div className='mt-4 text-center'>
          <p className='text-sm text-slate-400'>Showing top 10 of {leaderboard.length} players</p>
        </div>
      )}

      {!isSignedIn && (
        <div className='mt-3 flex-shrink-0 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3 backdrop-blur-sm'>
          <div className='mb-2 flex items-center gap-2'>
            <User className='h-4 w-4 text-blue-400' />
            <p className='text-sm font-semibold text-blue-300'>Sign in to save scores!</p>
          </div>
          <SignInButton mode='modal'>
            <button className='flex w-full items-center justify-center gap-1 rounded bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700'>
              <User className='h-3 w-3' />
              Sign In
            </button>
          </SignInButton>
        </div>
      )}
    </div>
  );
}
