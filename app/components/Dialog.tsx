import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

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
    <motion.div
      className={`fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center self-center bg-opacity-50`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={close}
    >
      <div className={cn(`z-10 rounded-xl bg-gray-800 p-4 shadow-lg`, className)}>
        {closeButton || (
          <button onClick={close} className='float-end ml-1 text-2xl hover:text-red-700'>
            ✕
          </button>
        )}
        <div className='row-span-2 grid content-center items-center justify-center py-1'>{children}</div>
      </div>
    </motion.div>
  )
}

