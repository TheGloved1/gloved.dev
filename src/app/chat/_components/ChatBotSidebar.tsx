'use client'
import { Button } from '@/components/ui/button'
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
import { MessageSquare, Plus, X } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { redirect, useParams } from 'next/navigation'
import React, { useState } from 'react'

export default function ChatBotSidebar({ children }: { children: React.ReactNode }) {
  const { threadId } = useParams()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(true)
  const threads = useLiveQuery(
    () => db.getThreads(),
    [db.threads],
    []
  )

  const handleDelete = async (id: string) => {
    await db.deleteThread(id)
    if (threadId === id) {
      redirect('/chat')
    }
  }

  const isThreadCurrent = (id: string) => threadId === id

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <div className='mx-auto flex h-dvh w-dvw'>
        <Sidebar>
          <SidebarContent className='bg-gradient-to-bl from-gray-200 to-gray-600'>
            {/* <PageBack stayTop noFixed btnClassName='btn mt-2 w-fit bg-gray-700 hover:bg-gray-600' /> */}
            <div className='mt-2 w-fit'></div>
            {threadId !== undefined && (
              <>
                <div className='divider divider-neutral text-gray-700'>New Chat</div>
                <SidebarGroup>
                  <Link href='/chat' type='button' title='New chat' className='btn card rounded-xl'>
                    <Plus className='h-4 w-4' />
                    <span className='sr-only'>New chat</span>
                  </Link>
                </SidebarGroup>
              </>
            )}
            <ScrollArea>
              <div className='divider divider-neutral text-gray-700'>Chats</div>
              {threads?.length ?
                threads.reverse().map((thread) => (
                  <div key={thread.id} className='p-2'>
                    <Link
                      key={thread.id}
                      href={`/chat/${thread.id}`}
                      className={`my-0 flex items-center rounded-sm px-2 focus-within:outline-none focus-within:ring-[1px] focus-within:ring-[hsl(var(--ring))] hover:bg-[#2D2D2D]/100 ${isThreadCurrent(thread.id) ? 'bg-[#2D2D2D]/50' : ''}`}
                    >
                      <div className='flex flex-1 flex-row gap-2 rounded-sm text-xs py-1 card items-center text-info-content group-data-[state=hover]:bg-[#2D2D2D]/50'>
                        <div
                          className={`flex flex-1 flex-row gap-2 py-3 ${isThreadCurrent(thread.id) ? 'font-bold cursor-default' : ''}`}
                        >
                          <MessageSquare className='h-4 w-4' />
                          {thread.title}
                        </div>
                        <Button
                          variant='ghost'
                          className='w-12 h-11 ml-auto md:opacity-0 transition-opacity duration-500 md:group-hover:opacity-100 hover:text-red-800'
                          title='Delete Chat'
                          onClick={() => handleDelete(thread.id)}
                        >
                          <X height={11} width={12} />
                        </Button>
                      </div>
                    </Link>
                  </div>
                ))
                : <p className='text-center p-2 text-gray-500'>No chats created</p>}
            </ScrollArea>
          </SidebarContent>
        </Sidebar>
        <div className='p-4'>
          <SidebarTrigger
            className={`fixed left-2 top-2 z-50 ${isMobile ? ''
              : open ? 'text-gray-800 hover:bg-gray-800 hover:text-gray-200'
                : 'text-gray-200 hover:bg-gray-200 hover:text-gray-800'
              }`}
          />
        </div>
        {children}
      </div>
    </SidebarProvider>
  )
}
