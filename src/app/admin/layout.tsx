'use client';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='absolute left-0 top-0 flex items-center gap-2 border border-border p-2'>
        <SignedOut>
          <SignInButton mode={'modal'}>
            <Button className='btn gap-1'>Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className='flex items-center gap-2'>
            <UserButton showName />
          </div>
        </SignedIn>
      </div>
      {children}
    </>
  );
}
