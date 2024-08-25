"use client"
import React from "react"

export function ModalButton() {
  return (
    <>
      <button className="btn" onClick={() => document.querySelector("dialog")?.showModal()}>{"Open Modal"}</button>
    </>
  )
}

export function ModalDialog({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <dialog className="z-10 p-2 bg-white rounded">
        {children}
        <button className="btn" onClick={() => document.querySelector("dialog")?.close()}>{"Close"}</button>
      </dialog>
    </>
  )
}
