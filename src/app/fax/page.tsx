'use client';

import { RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function EnhancedFactGenerator() {
  const [fact, setFact] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateFact = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const data = await response.json();
      setFact(data.text);
    } catch (error) {
      setFact('Oops! Could not fetch a fact right now. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter'></div>
        <div className='absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-pink-500 opacity-20 mix-blend-multiply blur-xl filter delay-1000'></div>
        <div className='absolute left-40 top-40 h-80 w-80 animate-pulse rounded-full bg-indigo-500 opacity-20 mix-blend-multiply blur-xl filter delay-500'></div>
      </div>

      <div className='relative w-full max-w-2xl'>
        {/* Main card */}
        <div className='rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <div className='mb-4 flex items-center justify-center gap-3'>
              <Sparkles className='h-8 w-8 text-yellow-400' />
              <h1 className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl'>
                {"Borbo's Fax Machine"}
              </h1>
              <Sparkles className='h-8 w-8 text-yellow-400' />
            </div>
          </div>

          {/* Generate button */}
          <div className='mb-8 text-center'>
            <button
              onClick={generateFact}
              disabled={isLoading}
              className='group relative inline-flex transform items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-purple-500 hover:to-pink-500 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              <RefreshCw
                className={`h-5 w-5 ${isLoading ? 'animate-spin' : 'transition-transform duration-300 group-hover:rotate-180'}`}
              />
              {isLoading ? 'Generating...' : 'Generate Interesting Fact'}

              {/* Button glow effect */}
              <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 blur transition-opacity duration-200 group-hover:opacity-20'></div>
            </button>
          </div>

          {/* Fact display */}
          <div className='flex min-h-[120px] items-center justify-center'>
            {fact ?
              <div className='rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm'>
                <p className='text-center text-lg font-medium leading-relaxed text-white md:text-xl'>{fact}</p>
              </div>
            : <div className='text-center'>
                <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20'>
                  <Sparkles className='h-8 w-8 text-purple-300' />
                </div>
                <p className='text-lg text-purple-200 opacity-60'>Click the button above to discover an amazing fact!</p>
              </div>
            }
          </div>
        </div>

        {/* Footer */}
        <div className='mt-6 text-center'>
          <p className='text-sm text-purple-300 opacity-60'>Facts powered by uselessfacts.jsph.pl</p>
        </div>
      </div>
    </div>
  );
}
