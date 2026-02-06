'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className='flex-shrink-0 border-b border-white/10 px-4 py-3 lg:px-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='glow-line h-2 w-2 bg-fuchsia-500' />
          <h1 className='font-display text-xl font-bold uppercase tracking-tight lg:text-2xl'>
            <span className='glitch-text'>BG</span>
            <span className='text-fuchsia-500'>_</span>
            <span className='glitch-text'>REMOVER</span>
          </h1>
          <Link href='/'>
            <span className='font-mono-industrial hidden text-[10px] tracking-[0.2em] text-white/30 hover:text-white lg:inline'>
              GLOVED.DEV
            </span>
          </Link>
        </div>
        <div className='flex items-center gap-4'>
          <div className='font-mono-industrial hidden text-[10px] text-white/30 lg:flex lg:items-center lg:gap-4'>
            <span>LOCAL PROCESSING</span>
            <span>•</span>
            <span>ZERO UPLOAD</span>
          </div>
          <div className='flex h-8 w-8 items-center justify-center border border-fuchsia-500/50 bg-fuchsia-500/10'>
            <div className='h-1.5 w-1.5 animate-pulse bg-fuchsia-500' />
          </div>
        </div>
      </div>
    </header>
  );
}
