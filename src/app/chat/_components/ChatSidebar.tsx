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
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { dxdb } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import ChatSidebarTrigger from './ChatSidebarTrigger';

export default function ChatSidebar({ children }: { children?: React.ReactNode }) {
  const { threadId } = useParams<{ threadId: string }>();
  const router = useRouter();
  const threads = useLiveQuery(() => dxdb.getThreads());

  const isCurrentThread = (id: string) => threadId === id;

  const handleDelete = async (id: string) => {
    const { error } = await tryCatch(dxdb.deleteThread(id)); // Delete the thread
    if (error) return toast.error('Error deleting thread'), router.push('/chat');
    toast.success('Thread deleted');
    if (isCurrentThread(id)) router.replace('/chat');
  };

  return (
    <SidebarProvider className='flex min-h-svh w-full'>
      <Sidebar variant='sidebar' className='border border-border'>
        <SidebarHeader>
          <h1 className='flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75'>
            [
            <Link
              href={'/'}
              className={
                'relative flex h-8 w-24 items-center justify-center rounded border border-border/10 text-sm font-semibold text-foreground hover:border-border/90'
              }
            >
              gloved<span className='text-[hsl(280,93%,72%)]'>.</span>dev
            </Link>
            ]
          </h1>
          <Link
            href='/chat'
            type='button'
            title='New chat'
            className='border-reflect button-reflect relative mt-2 inline-flex h-9 w-full select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[rgb(162,59,103)] bg-primary/20 p-2 px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-[#d56698] hover:bg-pink-800/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:bg-[rgb(162,59,103)] active:bg-pink-800/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[rgb(162,59,103)] disabled:hover:bg-primary/20 disabled:active:bg-[rgb(162,59,103)] disabled:active:bg-primary/20 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
          >
            New Chat
          </Link>
        </SidebarHeader>
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarContent className='rounded bg-gradient-to-bl from-[--background] to-[--background-secondary] text-white'>
          {threads?.length ?
            threads.map((thread) => (
              <SidebarGroup key={thread.id}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <span data-state='closed'>
                      <SidebarMenuItem>
                        <Link
                          className={
                            'group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent' +
                            (isCurrentThread(thread.id) ? ' bg-sidebar-accent text-sidebar-accent-foreground' : '')
                          }
                          href={`/chat/${thread.id}`}
                          title={thread.title}
                        >
                          <div className='relative flex w-full items-center'>
                            <div className='relative w-full'>
                              <div
                                title={thread.title}
                                className='hover:truncate-none pointer-events-none h-full w-full cursor-pointer overflow-hidden truncate rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none'
                              >
                                {thread.title}
                              </div>
                            </div>
                            <div className='pointer-events-auto absolute -right-1 bottom-0 top-0 z-50 flex translate-x-full items-center justify-end text-muted-foreground transition-transform group-hover/link:translate-x-0 group-hover/link:bg-sidebar-accent'>
                              <div className='pointer-events-none absolute bottom-0 right-[100%] top-0 h-12 w-8 bg-gradient-to-l from-sidebar-accent to-transparent opacity-0 group-hover/link:opacity-100'></div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button
                                    className='rounded-md p-1.5 hover:bg-destructive/50 hover:text-destructive-foreground'
                                    title='Delete Chat'
                                  >
                                    <X width={24} height={24} className='!size-4' />
                                  </button>
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
                            </div>
                          </div>
                        </Link>
                      </SidebarMenuItem>
                    </span>
                  </SidebarMenu>
                </SidebarGroupContent>
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
