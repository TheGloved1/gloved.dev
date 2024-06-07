"use client"

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
      <dialog className="p-2 bg-white rounded z-10">
        {children}
        <button className="btn" onClick={() => document.querySelector("dialog")?.close()}>{"Close"}</button>
      </dialog>
    </>
  )
}
