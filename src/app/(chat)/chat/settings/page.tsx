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
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { dxdb } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { ChevronLeft, Download, RefreshCw, Trash, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'customization' | 'sync'>('customization');
  const [syncEnabled, setSyncEnabled] = useLocalStorage<boolean>('syncEnabled', false);
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string | undefined>('systemPrompt', undefined);
  const router = useRouter();
  const auth = useAuth();

  const handleDelete = async () => {
    await dxdb.deleteAllData(auth.userId);
    toast.success('Data deleted');
    setDeleteDialogOpen(false);
    router.push('/chat');
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);
    const onClick = () => {
      input.remove();
    };
    input.addEventListener(
      'change',
      async (e) => {
        onClick();
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const text = await file.text();
        await dxdb.import(text);
        toast.success('Data imported');
      },
      { once: true },
    );
    input.click();
  };

  const handleExport = async () => {
    const { error } = await tryCatch(dxdb.export());
    if (error) return toast.error('Failed to export data');
    toast.success('Data exported');
  };

  const handleSyncNow = useCallback(async () => {
    if (!auth.userId) return;
    await dxdb.syncDexie(auth.userId);
    toast.success('Data synced');
  }, [auth.userId]);

  useEffect(() => {
    if (syncEnabled) {
      handleSyncNow();
    }
  }, [handleSyncNow, syncEnabled]);

  if (auth.isLoaded && !auth.isSignedIn) return router.replace('/sign-in');

  return (
    <div className='h-screen w-full overflow-y-auto'>
      <div className='mx-auto flex w-full flex-col overflow-y-auto px-4 pb-24 pt-6 md:px-6 lg:px-8'>
        <header className='flex items-center justify-between pb-8 pt-12 md:pt-0'>
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
        </header>
        <div className='flex w-fit max-w-[800px] flex-grow flex-col gap-4 md:flex-row'>
          <Tabs defaultValue='customization' value={activeTab} onValueChange={setActiveTab as (value: string) => void}>
            <TabsList className='no-scrollbar inline-flex h-9 w-full items-stretch justify-evenly overflow-auto rounded-lg bg-secondary/80 p-1 text-secondary-foreground sm:w-fit lg:mx-auto'>
              <TabsTrigger value='customization'>Customization</TabsTrigger>
              <TabsTrigger value='sync'>History & Sync</TabsTrigger>
            </TabsList>
            <TabsContent value='customization'>
              <div className='space-y-6'>
                <h2 className='text-2xl font-bold'>AI Personality</h2>
                <p className='text-muted-foreground/80'>
                  How would you like the AI to respond? (Leave blank to use default)
                </p>
                <textarea
                  value={systemPrompt ?? undefined}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder={`For example: "Your name is John, and you work at McDonald's. You are a deeply disturbed person who has a strong desire to tell people that you know how doors work."`}
                  className='flex min-h-[175px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[150px] md:min-h-[100px] md:text-sm'
                />
              </div>
            </TabsContent>
            <TabsContent value='sync'>
              <div className='mt-2 w-full space-y-12 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'>
                <section className='space-y-2'>
                  <h2 className='text-2xl font-bold'>Cloud Sync</h2>
                  <div className='space-y-6'>
                    <div className='flex flex-col gap-2'>
                      <p className='text-muted-foreground/80'>
                        Enable and disable Cloud Sync. Threads will be synced whenever new messages are sent.{' '}
                        <span className='text-sm text-red-700'>(EXPERIMENTAL: May cause data loss, use with caution)</span>
                      </p>
                    </div>
                    <div className='flex flex-col gap-4'>
                      <AlertDialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
                        <AlertDialogContent color='black'>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Enable Cloud Sync? <span className='text-red-700'>(EXPERIMENTAL)</span>
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {`Are you sure you want to enable Cloud Sync? This will sync your threads with the cloud and could cause data loss or corruption.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSyncDialogOpen(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setSyncEnabled(true)}>Enable</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        <div className='flex flex-row items-center gap-2'>
                          <label
                            className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                            htmlFor='sync-enabled'
                          >
                            Enable Cloud Sync{' '}
                          </label>
                          <Switch
                            id='sync-enabled'
                            checked={syncEnabled}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSyncDialogOpen(true);
                              } else {
                                setSyncEnabled(false);
                              }
                            }}
                          />
                        </div>
                        <div className='flex'>
                          <Button variant='secondary' onClick={handleSyncNow}>
                            <RefreshCw className='mr-2 h-5 w-5' />
                            Sync Now
                          </Button>
                        </div>
                      </AlertDialog>
                    </div>
                  </div>
                </section>
                <section className='space-y-2'>
                  <h2 className='text-2xl font-bold'>Message History</h2>
                  <div className='space-y-6'>
                    <p className='text-muted-foreground/80'>{"Save your history as JSON, or import someone else's."}</p>
                    <div className='flex flex-row gap-2'>
                      <Button variant='secondary' onClick={() => handleImport()}>
                        <Download className='mr-2 h-5 w-5' />
                        Import
                      </Button>
                      <Button variant='secondary' onClick={handleExport}>
                        <Upload className='mr-2 h-5 w-5' />
                        Export
                      </Button>
                    </div>
                  </div>
                </section>
                <section className='-m-4 w-fit space-y-2 rounded-lg border border-muted-foreground/10 p-4 hover:bg-red-800/20'>
                  <h2 className='text-2xl font-bold'>Danger Zone</h2>
                  <div className='space-y-6'>
                    <p className='text-sm text-muted-foreground/80'>
                      Permanently delete your history from both your local device and our servers.
                    </p>
                    <div className='flex flex-row gap-2'>
                      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant='destructive'>
                            <Trash className='mr-2 h-5 w-5' />
                            Delete Chat History
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Delete Chat History</DialogTitle>
                          <p className='text-sm text-muted-foreground/80'>
                            Are you sure you want to delete your chat history? This action cannot be undone.
                          </p>
                          <div className='mt-4 flex flex-row gap-2'>
                            <Button variant='destructive' onClick={handleDelete}>
                              Delete
                            </Button>
                            <Button variant='secondary' onClick={() => setDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
