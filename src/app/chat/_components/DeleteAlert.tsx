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
import { dxdb, Thread } from '@/dexie';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { tryCatch } from '@/lib/utils';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const DeleteAlert = ({ id, isCurrentThread }: { id: string; isCurrentThread: boolean }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [lastThreadList, setLastThreadList] = usePersistentState<Thread[]>('lastThreadList', []);

  const handleDelete = async () => {
    const { error } = await tryCatch(dxdb.deleteThread(id)); // Delete the thread
    if (error) return toast.error('Error deleting thread'), router.replace('/chat');
    setLastThreadList(lastThreadList.filter((t) => t.id !== id));
    toast.success('Thread deleted');
    setIsOpen(false);
    if (isCurrentThread) router.replace('/chat');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className='absolute right-0 top-1/2 h-12 w-12 -translate-y-1/2 pl-4 text-gray-500 transition-opacity duration-500 hover:text-red-800 md:opacity-0 md:group-hover:opacity-100'
          title='Delete Chat'
          onClick={() => setIsOpen(true)}
        >
          <X height={16} width={16} />
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>This action cannot be undone. This will permanently delete this thread.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='secondary'>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAlert;
