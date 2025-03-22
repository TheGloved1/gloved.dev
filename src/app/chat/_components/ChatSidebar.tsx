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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { dxdb, Thread } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { MessageSquare, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import ChatSidebarTrigger from './ChatSidebarTrigger';

export default function ChatBotSidebar({ children }: { children?: React.ReactNode }) {
  const { threadId } = useParams<{ threadId: string }>();
  const router = useRouter();
  const threads = useLiveQuery(() => dxdb.getThreads());
  const [lastThreadList, setLastThreadList] = usePersistentState<Thread[]>('lastThreadList', []);

  const isCurrentThread = (id: string) => threadId === id;

  const handleDelete = async (id: string) => {
    const { error } = await tryCatch(dxdb.deleteThread(id)); // Delete the thread
    if (error) return toast.error('Error deleting thread'), router.push('/chat');
    setLastThreadList(lastThreadList.filter((t) => t.id !== id));
    toast.success('Thread deleted');
    if (isCurrentThread(id)) router.replace('/chat');
  };

  return (
    <SidebarProvider className='flex min-h-svh w-full'>
      <Sidebar className='border border-border'>
        <SidebarHeader>
          <h1 className='flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75'>
            <Link
              href={'/'}
              className={'relative flex h-8 w-24 items-center justify-center text-sm font-semibold text-foreground'}
            >
              gloved<span className='text-[hsl(280,93%,72%)]'>.</span>dev
            </Link>
          </h1>
          <>
            <SidebarGroup>
              <Button
                className='w-full rounded-sm bg-[--background-secondary] p-2 text-gray-200'
                variant='outline'
                title='New chat'
              >
                <Link href='/chat' type='button' title='New chat'>
                  New Chat
                </Link>
              </Button>
            </SidebarGroup>
          </>
        </SidebarHeader>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
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
          <SignedOut>
            <div className='flex items-center gap-2'>
              <SignInButton mode={'modal'}>
                <Button className='w-full gap-1'>Sign in</Button>
              </SignInButton>
              <Link href='/chat/settings' type='button'>
                <Button variant='ghost' className='h-8 w-8 rounded-full p-0 text-2xl'>
                  <Settings className='h-5 w-5' />
                </Button>
              </Link>
            </div>
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
        </SidebarFooter>
      </Sidebar>
      <ChatSidebarTrigger />
      {children}
    </SidebarProvider>
  );
}
