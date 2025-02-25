import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { db, Thread } from '@/db'
import { usePersistentState } from '@/hooks/use-persistent-state'
import { tryCatch } from '@/lib/utils'
import { X } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const DeleteAlert = ({ id, isCurrentThread }: { id: string; isCurrentThread: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [lastThreadList, setLastThreadList] = usePersistentState<Thread[]>('lastThreadList', [])

  const handleDelete = async () => {
    const { error } = await tryCatch(db.deleteThread(id)) // Delete the thread
    if (error) return toast.error('Error deleting thread'), redirect('/chat')
    setLastThreadList(lastThreadList.filter((t) => t.id !== id))
    toast.success('Thread deleted')
    setIsOpen(false)
    if (isCurrentThread) redirect('/chat')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className='w-12 h-12 pl-7 ml-auto md:opacity-0 transition-opacity duration-500 text-gray-500 md:group-hover:opacity-100 hover:text-red-800'
          title='Delete Chat'
          onClick={() => setIsOpen(true)}
        >
          <X height={16} width={16} />
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this thread.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='secondary'>Cancel</Button>
          </DialogClose>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAlert
