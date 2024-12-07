import React from 'react'
import Button from '@/components/Buttons'
import { cn } from '@/lib/utils'

type DialogProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  closeButton?: React.ReactNode
}

export default function Dialog({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  closeButton
}: DialogProps): React.JSX.Element | null {
  if (!isOpen) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-50`}>
      <div className={cn(`z-10 rounded-xl bg-gray-800 p-4 shadow-lg`, className)}>
        <div className='row-span-2 grid items-center justify-center py-1'>
          {children}
          <div className='flex items-center justify-center'>
            {closeButton || (
              <Button
                onClick={onClose}
                className='btn btn-warning m-2 rounded-xl p-4 hover:animate-pulse'
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
