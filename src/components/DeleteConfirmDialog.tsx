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
  onConfirm: () => void
  onPermanentDelete: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  fileName,
  onConfirm,
  onPermanentDelete,
  onCancel,
}: DeleteConfirmDialogProps): React.JSX.Element {
  const [isPermanentDelete, setIsPermanentDelete] = useState(false)

  const handleDelete = () => {
    if (isPermanentDelete) {
      onPermanentDelete()
    } else {
      onConfirm()
    }
  }

  return (
    <AlertDialog open={true}>
      <AlertDialogContent color='black'>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this file?</AlertDialogTitle>
          <AlertDialogDescription>
            {`This action cannot be undone. This will ${isPermanentDelete ? 'permanently ' : ''}delete the file: `}
            <span className='font-semibold'>{fileName}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='flex items-center space-x-2 py-4'>
          <Switch id='permanent-delete' checked={isPermanentDelete} onCheckedChange={setIsPermanentDelete} />
          <label htmlFor='permanent-delete'>Permanent Delete</label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
