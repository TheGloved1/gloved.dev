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
      className={`flex fixed top-0 right-0 bottom-0 left-0 z-50 justify-center items-center place-items-center place-self-center p-0 m-0 align-middle bg-gray-800 rounded-xl sm:max-w-[70vw] sm:max-h-[70vh]`}
      {...props}
    >
      <div className='grid row-span-2 justify-center content-center items-center place-items-center p-4'>
        {closeButton || (
          <button onClick={close} className='absolute top-2 right-2 p-0 m-0 mx-auto text-2xl hover:text-red-700'>
            ✕
          </button>
        )}
        {children}
      </div>
    </dialog>
  )
}
