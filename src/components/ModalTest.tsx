"use client"
import { Button } from "./ui/button"

export function ModalTest() {
  return (
    <>
      <div>
        <h1>Modal Test</h1>
        <Button onClick={() => document.querySelector("dialog")?.showModal()}>{"Open Modal"}</Button>
      </div>
      <dialog className="p-2 bg-white rounded z-10">
        <div>{"This is a modal"}</div>
        <Button onClick={() => document.querySelector("dialog")?.close()}>{"Close"}</Button>
      </dialog>
    </>
  )
}
