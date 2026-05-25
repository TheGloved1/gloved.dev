'use client';
import { CornerDecorations } from '@/components/CornerDecorations';
import { Button } from '@/components/ui/button';
import { useInterval } from '@/hooks/use-interval';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check, Copy, Printer, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { generateFactAction } from '../actions';

const loadingHeadings = [
  'RECEIVING FAX...',
  'TRANSMITTING DATA...',
  'DECODING SIGNAL...',
  'SYNTHESIZING FACTS...',
  'CONTACTING SATELLITE...',
  'CONNECTING TO AI...',
  'WARMING UP TUBES...',
];

const loadingSubtitles = [
  'SCANNING AUTOMOTIVE DATABASES...',
  'CONSULTING AUTOMOTIVE ARCHIVES...',
  'DIALING INTO THE AI NETWORK...',
  'CRANKING THE FAX MACHINE...',
  'FETCHING FRESH CAR TRIVIA...',
  'DUSTING OFF THE MANUALS...',
  'REVVING THE AI ENGINE...',
];

export default function FactGenerator() {
  const [fact, setFact] = useLocalStorage('fax_fact', '');
  const [isLoading, setIsLoading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);

  useInterval(() => {
    if (!isLoading) return;
    setLoadingIndex((prev) => (prev + 1) % loadingHeadings.length);
  }, 3000);

  const generateFact = async () => {
    setIsLoading(true);
    setLoadingIndex(0);
    try {
      const result = await generateFactAction();
      setFact(result);
    } catch (_error) {
      setFact('Oops! Could not generate a fact right now. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fact);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    } catch (_err) {}
  };

  return (
    <div className='w-full max-w-lg space-y-8'>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='text-center'>
        <div className='mb-4 flex items-center justify-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
            <Printer className='h-6 w-6 text-fuchsia-400' />
          </div>
          <h1 className='font-display text-4xl font-bold uppercase tracking-tight text-white'>FAX MACHINE</h1>
        </div>
        <p className='font-mono-industrial text-sm text-white/50'>AI-powered random facts at your fingertips</p>
      </motion.div>

      {/* Fact Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {!fact ?
          <div
            className={cn(
              'group relative h-full w-full border-2 border-dashed transition-all duration-300',
              isLoading ? 'border-fuchsia-500 bg-fuchsia-500/5' : 'border-white/20 hover:border-white/40',
            )}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <CornerDecorations hovering={hovering} />

            <div className='flex h-full flex-col items-center justify-center p-8'>
              <div
                className={cn(
                  'mb-6 flex h-20 w-20 items-center justify-center border transition-all duration-300',
                  isLoading ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 bg-white/5',
                )}
              >
                <Printer
                  className={cn(
                    'h-10 w-10 transition-colors',
                    isLoading ? 'animate-pulse text-fuchsia-400' : 'text-white/30',
                  )}
                />
              </div>

              <div className='space-y-3 text-center'>
                <h2 className='font-display text-2xl font-bold uppercase tracking-tight lg:text-3xl'>
                  {isLoading ? loadingHeadings[loadingIndex] : 'GENERATE FACT'}
                </h2>
                <p className='font-mono-industrial text-xs text-white/50'>
                  {isLoading ? loadingSubtitles[loadingIndex] : 'CLICK THE BUTTON BELOW TO GENERATE A RANDOM FACT'}
                </p>
              </div>

              <Button
                onClick={generateFact}
                disabled={isLoading}
                className='brutal-shadow mt-8 border-fuchsia-500 bg-fuchsia-500 text-white hover:border-fuchsia-400 hover:bg-fuchsia-600 disabled:pointer-events-none disabled:opacity-50'
              >
                <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                {isLoading ? 'GENERATING...' : 'GENERATE'}
              </Button>
            </div>

            {isLoading && (
              <div className='absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent' />
            )}
          </div>
        : <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className='space-y-6'>
            {/* Fact Card */}
            <div className='border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5'>
              <div className='mb-4 flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <Printer className='h-5 w-5 text-fuchsia-400' />
                </div>
                <h3 className='font-display text-lg font-bold uppercase tracking-wide text-white'>INCOMING FAX</h3>
              </div>

              <div className='mb-6 min-h-[100px]'>
                <p className='font-mono-industrial break-words text-sm leading-relaxed text-white/80'>{fact}</p>
              </div>

              <div className='flex items-center justify-between border-t border-white/10 pt-4'>
                <span className='font-mono-industrial text-xs text-white/50'>TRANSMISSION COMPLETE</span>
                <div className='flex gap-2'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleCopy}
                    className='brutal-shadow-sm h-8 w-8 border border-fuchsia-500/40 bg-fuchsia-500/10 p-0 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
                  >
                    <div className='relative flex items-center justify-center'>
                      <Copy
                        className={cn(
                          'h-4 w-4 transition-all duration-200',
                          isCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
                        )}
                      />
                      <Check
                        className={cn(
                          'absolute inset-0 flex h-4 w-4 items-center justify-center text-green-400 transition-all duration-200',
                          isCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                        )}
                      />
                    </div>
                  </Button>
                  <Button
                    onClick={generateFact}
                    disabled={isLoading}
                    className='brutal-shadow-sm border-fuchsia-500 bg-fuchsia-500 text-white hover:border-fuchsia-400 hover:bg-fuchsia-600 disabled:pointer-events-none disabled:opacity-50'
                    size='sm'
                  >
                    <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
                    {isLoading ? 'WAIT...' : 'NEXT'}
                  </Button>
                </div>
              </div>
            </div>

            {/* History note */}
            <p className='font-mono-industrial text-center text-xs text-white/50'>FACTS POWERED BY AI</p>
          </motion.div>
        }
      </motion.div>
    </div>
  );
}
