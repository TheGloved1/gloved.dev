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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { dxdb, Thread } from '@/dexie';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { tryCatch } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, Home, MessageSquare, Plus, Settings, SquarePen, X } from 'lucide-react';
import { Link } from 'next-view-transitions';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { toast } from 'sonner';

export default function ChatBotSidebar({ children }: { children?: React.ReactNode }) {
  const { threadId } = useParams<{ threadId: string }>();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const threads = useLiveQuery(() => dxdb.getThreads());
  const [lastThreadList, setLastThreadList] = usePersistentState<Thread[]>('lastThreadList', []);

  const isCurrentThread = useCallback((id: string) => threadId === id, [threadId]);

  const handleDelete = async (id: string) => {
    const { error } = await tryCatch(dxdb.deleteThread(id)); // Delete the thread
    if (error) return toast.error('Error deleting thread'), router.push('/chat');
    setLastThreadList(lastThreadList.filter((t) => t.id !== id));
    toast.success('Thread deleted');
    if (isCurrentThread(id)) router.replace('/chat');
  };

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar variant='inset' className='m-0 border border-border'>
        <SidebarHeader>
          <SignedOut>
            <SignInButton mode={'modal'}>
              <Button className='btn gap-1'>Sign in</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className='flex items-center gap-2'>
              <UserButton showName />
              <Link href='/chat/settings' className='ml-auto'>
                <Button variant='ghost' className='h-8 w-8 rounded-full p-0 text-2xl'>
                  <Settings className='h-5 w-5' />
                </Button>
              </Link>
            </div>
          </SignedIn>
          {isMobile && (
            <>
              <div className='divider divider-neutral text-gray-200'>New Chat</div>
              <SidebarGroup>
                <Link href='/chat' type='button' title='New chat' className='btn card rounded-xl'>
                  <Plus className='h-4 w-4' />
                  <span className='sr-only'>New chat</span>
                </Link>
              </SidebarGroup>
            </>
          )}
          <div className='divider divider-neutral text-gray-200'>
            Chats{' '}
            {!isMobile && (
              <Link href='/chat' type='button' title='New chat' className='m-0 rounded-lg p-2 hover:bg-gray-500/50'>
                <SquarePen className='h-4 w-4' />
                <span className='sr-only'>New chat</span>
              </Link>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className='rounded bg-gradient-to-bl from-[--background] to-[--background-secondary]'>
          {threads?.length ?
            threads.map((thread) => (
              <SidebarGroup key={thread.id} className='group-chatbar peer overflow-x-hidden p-2'>
                <Link key={thread.id} href={`/chat/${thread.id}`} title={thread.title}>
                  <SidebarGroupContent
                    className={`hover:bg-[--background]/10 my-0 flex h-14 max-h-14 cursor-pointer items-center rounded-sm px-2 focus-within:outline-none focus-within:ring-[1px] focus-within:ring-[hsl(var(--ring))] hover:bg-gray-500/10 ${isCurrentThread(thread.id) ? 'bg-gray-500/20' : ''}`}
                  >
                    <div className='card flex flex-1 flex-row items-center gap-2 rounded-sm text-xs text-gray-200'>
                      <MessageSquare className='!size-5' width={16} height={16} />
                      <div
                        className={`flex flex-1 flex-row gap-2 py-2 text-xs text-gray-200 ${isCurrentThread(thread.id) ? 'cursor-default font-bold' : ''}`}
                      >
                        <span
                          style={{
                            fontSize: Math.max(12, 16 - thread.title.length / 2.5) + 'px',
                          }}
                        >
                          {thread.title}
                        </span>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </Link>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className='group-chatbar-hover absolute right-0 top-1/2 h-12 w-12 -translate-y-1/2 pl-4 text-gray-500 transition-all duration-200 hover:bg-transparent hover:text-red-800 md:translate-x-3 md:opacity-0'
                      variant='ghost'
                      title='Delete Chat'
                    >
                      <X height={16} width={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete this thread.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className='pt-4'>
                      <DialogClose asChild>
                        <Button variant='ghost'>Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button variant='destructive' onClick={() => handleDelete(thread.id)}>
                          Delete
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarGroup>
            ))
          : null}
        </SidebarContent>
        <SidebarFooter className='p-2'>
          <Button onClick={() => router.push('/')} variant='outline' className='w-full'>
            <ChevronLeft className='h-4 w-4' />
            <Home className='h-4 w-4' />
            gloved.dev
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger className={`z-10 ml-4 mt-4 ${isMobile ? 'fixed left-0 top-0' : ''}`} />
      {children}
    </SidebarProvider>
  );
}
