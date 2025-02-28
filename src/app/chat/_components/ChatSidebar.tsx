'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { db, Thread } from '@/db';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { useLiveQuery } from 'dexie-react-hooks';
import { MessageSquare, Plus, SquarePen } from 'lucide-react';
import { Link } from 'next-view-transitions';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import DeleteAlert from './DeleteAlert';

export default function ChatBotSidebar({ children }: { children: React.ReactNode }) {
  const { threadId } = useParams();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(true);
  const [lastThreadList, setLastThreadList] = usePersistentState<Thread[]>('lastThreadList', []);
  const threads = useLiveQuery(
    async () => {
      const threads = await db.getThreads();
      setLastThreadList(threads);
      return threads;
    },
    [db.threads],
    lastThreadList,
  );

  const isCurrentThread = (id: string) => threadId === id;

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar variant='inset' className='m-0 border border-border'>
        <SidebarContent className='rounded bg-gradient-to-bl from-[--background] to-[--background-secondary]'>
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
          {threads?.length ?
            threads.reverse().map((thread) => (
              <SidebarGroup key={thread.id} className='p-2'>
                <SidebarGroupContent
                  className={`hover:bg-[--background]/10 my-0 flex items-center rounded-sm px-2 focus-within:outline-none focus-within:ring-[1px] focus-within:ring-[hsl(var(--ring))] hover:bg-gray-500/10 ${isCurrentThread(thread.id) ? 'bg-gray-500/20' : ''}`}
                >
                  <Link key={thread.id} href={`/chat/${thread.id}`} title={thread.title}>
                    <div className='card flex flex-1 flex-row items-center gap-2 rounded-sm text-xs text-info-content group-data-[state=hover]:bg-[#2D2D2D]/50'>
                      <div
                        className={`flex flex-1 flex-row gap-2 py-2 text-xs text-gray-200 ${isCurrentThread(thread.id) ? 'cursor-default font-bold' : ''}`}
                      >
                        <MessageSquare className='h-5 w-5' />
                        {thread.title}
                      </div>
                    </div>
                  </Link>
                  <DeleteAlert id={thread.id} isCurrentThread={isCurrentThread(thread.id)} />
                </SidebarGroupContent>
              </SidebarGroup>
            ))
          : null}
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger className={`z-10 ml-4 mt-4 ${isMobile ? 'fixed left-0 top-0' : ''}`} />
      {children}
    </SidebarProvider>
  );
}
