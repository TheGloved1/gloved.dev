import React from 'react'
import { cn } from '@/lib/utils'

type DialogProps = {
  open: boolean
  close: () => void
  children: React.ReactNode
  className?: string
  closeButton?: React.ReactNode
}

export default function Dialog({
  open,
  close,
  children,
  className = '',
  closeButton,
}: DialogProps): React.JSX.Element | null {
  if (!open) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center self-center bg-opacity-50`}>
      <div className={cn(`z-10 rounded-xl bg-gray-800 p-4 shadow-lg`, className)}>
        <div className='row-span-2 grid content-center items-center justify-center py-1'>
          {children}
          <div className='flex items-center justify-center'>
            {closeButton || (
              <button onClick={close} className='btn btn-circle btn-ghost btn-sm absolute right-2 top-2 hover:text-red-700'>
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

