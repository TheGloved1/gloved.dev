'use client'
import React from 'react'

type DialogProps = {
  open: boolean
  close: () => void
  children: React.ReactNode
  className?: string
  closeButton?: React.ReactNode
} & React.ComponentProps<'dialog'>

export default function Dialog({ open, close, children, closeButton, ...props }: DialogProps): React.JSX.Element | null {
  if (!open) return null

  return (
    <dialog
      className={`fixed left-0 right-0 top-0 bottom-0 max-w-[70vw] max-h-[70vh] z-50 flex place-items-center items-center justify-center place-self-center rounded-xl bg-opacity-50 align-middle`}
      {...props}
    >
      <div className='items-center justify-center self-center rounded-xl bg-gray-800 p-4 shadow-lg'>
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
