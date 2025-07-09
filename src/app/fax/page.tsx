'use client';

import { RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Page() {
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
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-3 sm:p-4 md:p-6 lg:p-8'>
      {/* Background decoration - optimized for mobile */}
      <div className='absolute inset-0 overflow-hidden'>
        {/* Mobile: smaller, fewer decorative elements */}
        <div className='absolute -right-20 -top-20 h-40 w-40 animate-pulse rounded-full bg-purple-500 opacity-20 mix-blend-multiply blur-xl filter sm:h-60 sm:w-60 md:h-80 md:w-80'></div>
        <div className='absolute -bottom-20 -left-20 h-40 w-40 animate-pulse rounded-full bg-pink-500 opacity-20 mix-blend-multiply blur-xl filter delay-1000 sm:h-60 sm:w-60 md:h-80 md:w-80'></div>
        <div className='absolute left-20 top-20 h-40 w-40 animate-pulse rounded-full bg-indigo-500 opacity-20 mix-blend-multiply blur-xl filter delay-500 sm:h-60 sm:w-60 md:h-80 md:w-80'></div>
      </div>

      <div className='relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl'>
        {/* Main card - responsive padding and border radius */}
        <div className='rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-lg sm:rounded-3xl sm:p-6 md:p-8'>
          {/* Header - responsive typography and spacing */}
          <div className='mb-6 text-center sm:mb-8'>
            <div className='mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3'>
              <Sparkles className='h-6 w-6 flex-shrink-0 text-yellow-400 sm:h-7 sm:w-7 md:h-8 md:w-8' />
              <h1 className='bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-2xl font-bold leading-tight text-transparent sm:text-3xl md:text-4xl lg:text-5xl'>
                {"Borbo's Fax Machine"}
              </h1>
              <Sparkles className='h-6 w-6 flex-shrink-0 text-yellow-400 sm:h-7 sm:w-7 md:h-8 md:w-8' />
            </div>
          </div>

          {/* Generate button - mobile-optimized touch target */}
          <div className='mb-6 text-center sm:mb-8'>
            <button
              onClick={generateFact}
              disabled={isLoading}
              className='group relative inline-flex min-h-[48px] w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-purple-500 hover:to-pink-500 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[56px] sm:w-auto sm:gap-3 sm:rounded-2xl sm:px-8 sm:py-4 sm:text-base'
            >
              <RefreshCw
                className={`h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5 ${
                  isLoading ? 'animate-spin' : 'transition-transform duration-300 group-hover:rotate-180'
                }`}
              />
              <span className='truncate'>{isLoading ? 'Generating...' : 'Generate Interesting Fact'}</span>

              {/* Button glow effect */}
              <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 blur transition-opacity duration-200 group-hover:opacity-20 sm:rounded-2xl'></div>
            </button>
          </div>

          {/* Fact display - responsive height and text sizing */}
          <div className='flex min-h-[100px] items-center justify-center sm:min-h-[120px] md:min-h-[140px]'>
            {fact ?
              <div className='w-full rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:rounded-2xl sm:p-6'>
                <p className='break-words text-center text-sm font-medium leading-relaxed text-white sm:text-base md:text-lg lg:text-xl'>
                  {fact}
                </p>
              </div>
            : <div className='px-4 text-center'>
                <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 sm:mb-4 sm:h-14 sm:w-14 md:h-16 md:w-16'>
                  <Sparkles className='h-6 w-6 text-purple-300 sm:h-7 sm:w-7 md:h-8 md:w-8' />
                </div>
                <p className='text-sm leading-relaxed text-purple-200 opacity-60 sm:text-base md:text-lg'>
                  Tap the button above to discover a random fact!
                </p>
              </div>
            }
          </div>
        </div>

        {/* Footer - responsive text sizing */}
        <div className='mt-4 px-4 text-center sm:mt-6'>
          <p className='text-xs text-purple-300 opacity-60 sm:text-sm'>Facts powered by uselessfacts.jsph.pl</p>
        </div>
      </div>

      {/* Mobile-specific improvements */}
      <style jsx global>{`
        @media (max-width: 640px) {
          body {
            -webkit-text-size-adjust: 100%;
            -webkit-tap-highlight-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
