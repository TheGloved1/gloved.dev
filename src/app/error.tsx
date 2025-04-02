'use client';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Error:', JSON.stringify(error));
  }, [error]);

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center'>
      <div className='rounded-lg bg-white p-8 shadow-lg'>
        <h2 className='text-2xl font-bold text-purple-800'>Something went wrong!</h2>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
      <div className='rounded-lg bg-white p-8 shadow-lg'>
        <p className='text-sm text-gray-500'>Error digest: {error.message}</p>
      </div>
    </div>
  );
}
