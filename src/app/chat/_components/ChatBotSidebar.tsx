'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { db } from '@/db'
import { useIsMobile } from '@/hooks/use-mobile'
import { useLiveQuery } from 'dexie-react-hooks'
import { MessageSquare, Plus, SquarePen } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import DeleteAlert from './DeleteAlert'

export default function ChatBotSidebar({ children }: { children: React.ReactNode }) {
  const { threadId } = useParams()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(true)
  const threads = useLiveQuery(() => db.getThreads(), [db.threads], [])

  const isCurrentThread = (id: string) => threadId === id

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <Sidebar variant='inset' className='m-0 border border-border'>
        <SidebarContent className='bg-gradient-to-bl from-[--background] to-[--background-secondary] rounded'>
          {/* <PageBack stayTop noFixed btnClassName='btn mt-2 w-fit bg-gray-700 hover:bg-gray-600' /> */}
          <div className='mt-2 w-fit'></div>
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
          <ScrollArea>
            <div className='divider divider-neutral text-gray-200'>
              Chats{' '}
              {!isMobile && (
                <Link
                  href='/chat'
                  type='button'
                  title='New chat'
                  className='p-2 m-0 hover:bg-gray-500/50 rounded-lg'
                >
                  <SquarePen className='h-4 w-4' />
                  <span className='sr-only'>New chat</span>
                </Link>
              )}
            </div>
            {threads?.length ?
              threads.reverse().map((thread) => (
                <div key={thread.id} className='p-2'>
                  <div
                    className={`my-0 flex items-center rounded-sm px-2 focus-within:outline-none hover:bg-gray-500/10 focus-within:ring-[1px] focus-within:ring-[hsl(var(--ring))] hover:bg-[--background]/10 ${isCurrentThread(thread.id) ? 'bg-gray-500/20' : ''}`}
                  >
                    <Link key={thread.id} href={`/chat/${thread.id}`} title={thread.title}>
                      <div className='flex flex-1 flex-row gap-2 rounded-sm text-xs card items-center text-info-content group-data-[state=hover]:bg-[#2D2D2D]/50'>
                        <div
                          className={`flex flex-1 flex-row gap-2 py-2 text-xs text-gray-200 ${isCurrentThread(thread.id) ? 'font-bold cursor-default' : ''}`}
                        >
                          <MessageSquare className='h-5 w-5' />
                          {thread.title}
                        </div>
                      </div>
                    </Link>
                    <DeleteAlert id={thread.id} isCurrentThread={isCurrentThread(thread.id)} />
                  </div>
                </div>
              ))
            : null}
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger
        className={`fixed left-2 top-2 z-50 ${
          isMobile ? '' : (open ?? 'text-gray-800 hover:bg-gray-800 hover:text-gray-200')
        }`}
      />
      {children}
    </SidebarProvider>
  )
}
