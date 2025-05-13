'use client';
import PageBack from '@/components/PageBack';
import { useAuth, UserProfile } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Page() {
  const auth = useAuth();
  const router = useRouter();
  if (auth.isLoaded && !auth.userId) {
    return router.replace('/sign-in');
  }
  return (
    <main className='flex min-h-screen items-center justify-center'>
      <PageBack />
      <UserProfile />
    </main>
  );
}
