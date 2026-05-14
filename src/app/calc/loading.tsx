import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#0a0a0a]'>
      <Loader2 className='h-8 w-8 animate-spin text-fuchsia-500' />
    </div>
  );
}
