'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Error() {
  const { clearChatSettings } = useChat();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    clearChatSettings();
    window.location.reload();
  };

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center gap-6 p-4 text-center'>
      <div className='flex flex-col items-center gap-4'>
        <div className='rounded-full bg-destructive/10 p-4'>
          <AlertTriangle className='h-10 w-10 text-destructive' />
        </div>
        <h2 className='text-2xl font-bold tracking-tight'>Something went wrong</h2>
        <p className='max-w-md text-muted-foreground'>
          We encountered an error loading the chat page. Corrupted local storage data can sometimes cause this issue.
        </p>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row'>
        <Button variant='destructive' onClick={() => setOpen(true)}>
          <Trash2 className='h-4 w-4' />
          Clear Chat Data
        </Button>
        <Button variant='outline' onClick={() => window.location.reload()}>
          <RefreshCw className='h-4 w-4' />
          Reload Page
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all chat storage?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your chat settings including model preference, system prompt, tools, and sync options from
              local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Yes, Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
