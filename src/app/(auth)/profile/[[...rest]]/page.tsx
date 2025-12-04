'use client';
import PageBack from '@/components/PageBack';
import { useAuth, UserProfile } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export default function Page() {
  const auth = useAuth();
  if (auth.isLoaded && !auth.userId) {
    return (redirect('/sign-in'), null);
  }
  return (
    <Suspense fallback={<></>}>
      <main className='flex min-h-screen items-center justify-center'>
        <PageBack />
        <UserProfile />
      </main>
    </Suspense>
  );
}
