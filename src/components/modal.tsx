'use client'
import React from 'react'

export function ModalButton(): React.JSX.Element {
  return (
    <>
      <button className="btn" onClick={() => document.querySelector('dialog')?.showModal()}>
        {'Open Modal'}
      </button>
    </>
  )
}

export function ModalDialog({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <dialog className="z-10 rounded bg-white p-2">
        {children}
        <button className="btn" onClick={() => document.querySelector('dialog')?.close()}>
          {'Close'}
        </button>
      </dialog>
    </>
  )
}
