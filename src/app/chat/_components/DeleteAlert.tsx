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
import { db } from '@/db'
import { X } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const MyComponent = ({ id, isCurrentThread }: { id: string; isCurrentThread: boolean }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = async () => {
    try {
      await db.deleteThread(id) // Delete the thread
      toast.success('Thread deleted')
      setIsOpen(false)
      if (isCurrentThread) redirect('/chat')
    } catch (error) {
      console.error('Error deleting thread:', error)
      toast.error('Error deleting thread')
    }
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
            This action cannot be undone. This will permanently delete this thread and remove its
            data.
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

export default MyComponent
