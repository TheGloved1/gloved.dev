'use client';
import { ThemeChangerButton } from '@/components/ThemeChanger';
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
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { dxdb, Thread } from '@/lib/dexie';
import { tryCatch } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { TooltipContent } from '@radix-ui/react-tooltip';
import { useLiveQuery } from 'dexie-react-hooks';
import { Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import ChatSidebarTrigger from './ChatSidebarTrigger';

// Helper function to categorize threads by date
const categorizeThreads = (threads?: Thread[]) => {
  if (!threads || threads.length === 0) return {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const categories: { [key: string]: Thread[] } = {
    Today: [],
    Yesterday: [],
    'Last 7 days': [],
    Older: [],
  };

  threads.forEach((thread) => {
    const lastMessageDate = new Date(thread.last_message_at);

    if (lastMessageDate >= today) {
      categories['Today'].push(thread);
    } else if (lastMessageDate >= yesterday) {
      categories['Yesterday'].push(thread);
    } else if (lastMessageDate >= lastWeek) {
      categories['Last 7 days'].push(thread);
    } else {
      categories['Older'].push(thread);
    }
  });

  // Sort threads within each category by date (newest first)
  Object.keys(categories).forEach((category) => {
    categories[category].sort((a, b) => {
      const dateA = new Date(a.last_message_at || a.created_at || 0);
      const dateB = new Date(b.last_message_at || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  });

  return categories;
};

export default function ChatSidebar({ children }: { children?: React.ReactNode }) {
  const { threadId } = useParams<{ threadId: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const threads = useLiveQuery(() => dxdb.getThreads());
  const auth = useAuth();

  const categorizedThreads = useMemo(() => categorizeThreads(threads), [threads]);

  const isCurrentThread = (id: string) => threadId === id;

  const handleDelete = async (id: string) => {
    const { error } = await tryCatch(dxdb.deleteThread(id)); // Delete the thread
    if (error) return toast.error('Error deleting thread'), router.push('/chat');
    toast.success('Thread deleted');
    if (isCurrentThread(id)) router.replace('/chat');
  };

  if (pathname.includes('/settings')) return <>{children}</>;

  // Render a thread item
  const renderThreadItem = (thread: Thread) => (
    <SidebarMenuItem key={thread.id}>
      <Tooltip delayDuration={1000} disableHoverableContent>
        <TooltipContent side='bottom' className='z-20 rounded-md bg-accent px-2 text-[0.60rem] text-primary-foreground'>
          {thread.title}
        </TooltipContent>
        <TooltipTrigger asChild>
          <Link
            className={
              'group/link relative flex h-9 w-full items-center overflow-hidden rounded-lg px-2 py-1 text-sm outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring hover:focus-visible:bg-sidebar-accent' +
              (isCurrentThread(thread.id) ? ' bg-sidebar-accent text-sidebar-accent-foreground' : '')
            }
            href={`/chat/${thread.id}`}
          >
            <div className='relative flex w-full items-center'>
              <div className='relative w-full'>
                <div className='hover:truncate-none pointer-events-none h-full w-full cursor-pointer overflow-hidden truncate rounded bg-transparent px-1 py-1 text-sm text-muted-foreground outline-none'>
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
        </TooltipTrigger>
      </Tooltip>
    </SidebarMenuItem>
  );

  return (
    <TooltipProvider skipDelayDuration={0} disableHoverableContent>
      <SidebarProvider className='flex min-h-svh w-full'>
        <Sidebar variant='floating' className='m-0 border border-border p-0'>
          <SidebarHeader>
            <div className='absolute right-1 top-1 text-muted-foreground md:hidden'>
              <ThemeChangerButton />
            </div>
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
          <SidebarContent className='rounded bg-gradient-to-bl from-[--background] to-[--background-secondary] text-white'>
            {threads?.length ?
              Object.entries(categorizedThreads).map(
                ([category, categoryThreads]) =>
                  categoryThreads.length > 0 && (
                    <SidebarGroup key={category} className='relative flex w-full min-w-0 flex-col p-2'>
                      <SidebarGroupLabel className='ease-snappy text-color-heading flex h-8 shrink-0 select-none items-center rounded-md px-1.5 text-xs font-medium outline-none ring-sidebar-ring transition-[margin,opa] duration-200 focus-visible:ring-2 group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0'>
                        {category}
                      </SidebarGroupLabel>
                      <SidebarGroupContent className='w-full text-sm'>
                        <SidebarMenu>
                          {categoryThreads.map((thread) => (
                            <span key={thread.id} data-state='closed'>
                              {renderThreadItem(thread)}
                            </span>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  ),
              )
            : null}
          </SidebarContent>
          <SidebarFooter className='mb-1 p-2'>
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
                <Link
                  href='/chat/settings'
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!auth.userId) return router.push('/sign-in');
                    return router.push('/chat/settings');
                  }}
                  className='ml-auto'
                >
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
    </TooltipProvider>
  );
}
