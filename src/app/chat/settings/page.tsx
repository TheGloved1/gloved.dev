'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { dxdb } from '@/dexie';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { useAuth } from '@clerk/nextjs';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = usePersistentState<string | undefined>('systemPrompt', undefined);
  const auth = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    await dxdb.deleteAllData(auth.userId);
    toast.success('Data deleted');
    setDeleteDialogOpen(false);
    router.push('/chat');
  };

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
        <header className='mb-4 flex items-center justify-center'>
          <h1 className='text-3xl font-bold'>Settings</h1>
        </header>
        <div className='rounded p-4'>
          <h2 className='p-2 text-xl font-bold'>AI Personality</h2>
          <textarea
            value={systemPrompt ?? undefined}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder={`How would you like the AI to respond?\n(Leave blank to use default)`}
            className='h-[80vh] max-h-96 w-[80vw] max-w-full resize rounded border border-gray-300 p-2'
          />
        </div>
        <div className='rounded p-4'>
          <h2 className='p-2 text-xl font-bold'>Delete Data</h2>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                Delete Account Data
              </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-md'>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all your data.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='secondary'>Cancel</Button>
                </DialogClose>
                <Button onClick={handleDelete}>Delete</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
