'use client';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = usePersistentState<string | undefined>('systemPrompt', undefined);
  const router = useRouter();
  return (
    <div className='flex h-screen w-screen items-center justify-center'>
      <div className='max-h-md min-h-[600px] min-w-[400px] max-w-2xl rounded border border-gray-300 p-4'>
        <Link
          href={'/chat'}
          onClick={(e) => {
            e.preventDefault();
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/chat');
            }
          }}
          className='mb-4 flex items-center gap-2 self-start'
        >
          <ChevronLeft className='h-5 w-5' />
          <span className='text-sm font-medium'>Back to chat</span>
        </Link>
        <h1 className='text-3xl font-bold'>Settings</h1>
        <div className='rounded border border-gray-300 p-4'>
          <h2 className='text-xl font-bold'>AI Personality</h2>
          <textarea
            value={systemPrompt ?? undefined}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder='How would you like the AI to respond? (Leave blank to use default)'
            className='h-[60vh] max-h-96 min-h-[200px] w-[60vw] min-w-[400px] max-w-full resize rounded border border-gray-300 p-2'
          />
        </div>
      </div>
    </div>
  );
}
