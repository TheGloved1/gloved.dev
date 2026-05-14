'use client';
import { Button } from '@/components/ui/button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();

  return (
    <>
      <div className='fixed left-0 right-0 top-0 z-50 border-b border-fuchsia-500/30 bg-[#0a0a0a]/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between px-4 py-2'>
          <Link href='/' className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10'>
              <Shield className='h-4 w-4 text-fuchsia-500' />
            </div>
            <span className='font-display text-xs font-bold uppercase tracking-wide text-white'>Admin</span>
          </Link>
          {!isSignedIn ?
            <SignInButton mode={'modal'}>
              <Button className='brutal-shadow-sm h-8 border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs text-white hover:bg-fuchsia-500/20'>
                Sign in
              </Button>
            </SignInButton>
          : <div className='flex items-center gap-2'>
              <UserButton showName />
            </div>
          }
        </div>
      </div>
      <div className='h-screen overflow-hidden pt-12'>{children}</div>
    </>
  );
}
