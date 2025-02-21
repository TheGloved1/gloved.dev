'use client'
import PageBack from '@/components/PageBack'
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
import { useLiveQuery } from 'dexie-react-hooks'
import { MessageSquare, Plus, X } from 'lucide-react'
import Link from 'next/link'
import { redirect, useParams } from 'next/navigation'
import React from 'react'

export default function ChatBotSidebar({ children }: { children: React.ReactNode }) {
  const { threadId } = useParams()
  const [open, setOpen] = React.useState(true)
  const threads = useLiveQuery(
    () => db.threads.where('removed').equals('false').sortBy('last_message_at'),
    [db.threads],
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
            <PageBack stayTop noFixed btnClassName='btn mt-2 w-fit bg-gray-700 hover:bg-gray-600' />
            {threadId !== undefined && (
              <SidebarGroup>
                <div className='divider divider-neutral text-gray-700'>New Chat</div>
                <Link href='/chat' type='button' title='New chat' className='btn card rounded-xl'>
                  <Plus className='h-4 w-4' />
                  <span className='sr-only'>New chat</span>
                </Link>
              </SidebarGroup>
            )}
            <ScrollArea>
              <div className='divider divider-neutral text-gray-700'>Chats</div>
              {threads?.length ?
                threads.reverse().map((thread) => (
                  <div key={thread.id} className='p-2'>
                    <Link
                      key={thread.id}
                      href={`/chat/${thread.id}`}
                      className={`my-1 flex items-center rounded-sm px-2 focus-within:outline-none focus-within:ring-[1px] focus-within:ring-[hsl(var(--ring))] hover:bg-[#2D2D2D]/50 ${isThreadCurrent(thread.id) ? 'bg-[#2D2D2D]/50' : ''}`}
                    >
                      <div className='flex flex-1 flex-row gap-2 rounded-sm text-xs py-1 card items-center group'>
                        <MessageSquare className='h-7 w-7' />
                        {thread.title}
                        <Button
                          variant='ghost'
                          className='ml-auto place-items-end md:hidden md:group-hover:block hover:text-red-800'
                          title='Delete Chat'
                          onClick={() => handleDelete(thread.id)}
                        >
                          <X height={24} width={24} />
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
            className={`fixed left-2 top-2 z-50 ${open ? 'text-gray-500 hover:bg-gray-500 hover:text-gray-800' : 'text-gray-200 hover:bg-gray-200 hover:text-gray-800'}`}
          />
        </div>
        {children}
      </div>
    </SidebarProvider>
  )
}
