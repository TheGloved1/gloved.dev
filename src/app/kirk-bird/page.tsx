import { KirkBirdGame } from './_components/kirk-bird-game';
import { Leaderboard } from './_components/leaderboard';

export default function KirkBirdPage() {
  return (
    <div className='h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
      <div className='container mx-auto flex h-full flex-col px-4'>
        {/* Header */}
        <div className='flex-shrink-0 py-4 text-center'>
          <h1 className='mb-1 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-2xl font-bold text-transparent text-white md:text-3xl lg:text-4xl'>
            🐦 Kirk Bird
          </h1>
          <p className='text-sm text-gray-300 md:text-base'>Flap your way to the top!</p>
        </div>

        {/* Main Content */}
        <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-4 lg:flex-row lg:gap-6'>
          {/* Game Container */}
          <div className='flex min-h-0 w-full max-w-3xl items-center justify-center lg:max-w-4xl lg:flex-1'>
            <KirkBirdGame />
          </div>

          {/* Leaderboard Container */}
          <div className='max-h-64 w-full max-w-xl overflow-hidden lg:h-full lg:max-h-none lg:max-w-md lg:flex-shrink-0'>
            <Leaderboard />
          </div>
        </div>

        {/* Footer */}
        <div className='flex-shrink-0 py-2 text-center text-xs text-gray-400'>
          <p>Space/Click to Jump • Avoid Pipes • Beat Your Score</p>
        </div>
      </div>
    </div>
  );
}
