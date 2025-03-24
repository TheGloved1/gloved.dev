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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { dxdb } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const auth = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    await dxdb.deleteAllData(auth.userId);
    toast.success('Data deleted');
    setDeleteDialogOpen(false);
    router.push('/chat');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await dxdb.import(text);
    toast.success('Data imported');
  };

  const handleExport = async () => {
    const { error } = await tryCatch(dxdb.export());
    if (error) return toast.error('Failed to export data');
    toast.success('Data exported');
  };

  return (
    <div className='flex h-screen w-screen items-center justify-center text-xs sm:text-sm md:text-base'>
      <div className='mx-auto rounded p-4'>
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
          className='mb-4 flex items-center gap-2'
        >
          <ChevronLeft className='h-5 w-5' />
          <span className='text-sm font-medium'>Back to chat</span>
        </Link>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='rounded p-4'>
            <h2 className='p-2 font-bold md:text-3xl'>AI Personality</h2>
            <textarea
              value={systemPrompt ?? undefined}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder={`How would you like the AI to respond?\n(Leave blank to use default)`}
              className='h-[calc(100%-2rem)] resize-none rounded border border-gray-300 p-2 text-xs md:w-full'
            />
          </div>
          <div className='rounded p-4'>
            <h2 className='p-2 font-bold md:text-3xl'>Import & Export</h2>
            <div className='mb-4 flex items-center gap-2'>
              <Button variant='secondary'>
                <input type='file' accept='.json' onChange={handleImport} className='hidden' id='import-data' />
                <label htmlFor='import-data' className='cursor-pointer'>
                  Import
                </label>
              </Button>
              <Button variant='secondary' onClick={handleExport}>
                Export
              </Button>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                  Delete Data
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    {`This action cannot be undone. This will permanently delete all your data from your browser storage and
                    all your account data if you're currently logged in.`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant='secondary'>Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button variant='destructive' onClick={handleDelete}>
                      Delete
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
