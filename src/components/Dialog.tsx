'use client'
import { cn } from '@/lib/utils'
import React from 'react'

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
    <dialog
      className={`fixed z-50 flex max-w-fit place-items-center items-center justify-center place-self-center rounded-xl bg-opacity-50 align-middle`}
    >
      <div className={cn(`items-center justify-center self-center rounded-xl bg-gray-800 p-4 shadow-lg`, className)}>
        <div className='row-span-2 grid place-items-center content-center items-center justify-center py-1'>
          {closeButton || (
            <button onClick={close} className='absolute right-2 top-2 text-2xl hover:text-red-700'>
              ✕
            </button>
          )}
          {children}
        </div>
      </div>
    </dialog>
  )
}
