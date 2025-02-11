'use client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

interface DeleteConfirmDialogProps {
  fileName: string
  onConfirmAction: () => void
  onPermDeleteAction: () => void
  onCancelAction: () => void
}

export function DeleteConfirmDialog({
  fileName,
  onConfirmAction,
  onPermDeleteAction,
  onCancelAction,
}: DeleteConfirmDialogProps): React.JSX.Element {
  const [isPermDelete, setIsPermDelete] = useState(false)

  const handleDelete = () => {
    if (isPermDelete) {
      onPermDeleteAction()
    } else {
      onConfirmAction()
    }
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogContent color='black'>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. This will ${isPermDelete ? 'permanently ' : ''}delete the file: `}
            <span className='font-semibold'>{fileName}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='flex items-center space-x-2 py-4'>
          <Switch id='perm-delete' checked={isPermDelete} onCheckedChange={setIsPermDelete} />
          <label htmlFor='perm-delete'>Permanent Delete</label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancelAction}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
