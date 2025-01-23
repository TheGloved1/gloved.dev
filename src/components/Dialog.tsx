'use client'
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
    <dialog
      className={`fixed rounded-xl place-items-center place-self-center z-50 flex items-center justify-center align-middle bg-opacity-50 max-w-fit`}
    >
      <div className={cn(`items-center justify-center self-center rounded-xl bg-gray-800 p-4 shadow-lg`, className)}>
        <div className="place-items-center row-span-2 grid content-center items-center justify-center py-1">
          {closeButton || (
            <button onClick={close} className="absolute right-2 top-2 text-2xl hover:text-red-700">
              ✕
            </button>
          )}
          {children}
        </div>
      </div>
    </dialog>
  )
}
