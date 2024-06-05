"use client"
import { Button } from "./ui/button"

export function ModalButton() {
  return (
    <>
      <Button onClick={() => document.querySelector("dialog")?.showModal()}>{"Open Modal"}</Button>
    </>
  )
}

export function ModalDialog({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <dialog className="p-2 bg-white rounded z-10">
        {children}
        <Button onClick={() => document.querySelector("dialog")?.close()}>{"Close"}</Button>
      </dialog>
    </>
  )
}
