"use client"
import { useState } from "react"

export default function NewTodoForm({ onSubmit }: { onSubmit: (title: string) => void }) {
  const [newItem, setNewItem] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (newItem === "") return

    onSubmit(newItem)

    setNewItem("")
  }

  return (
    <form onSubmit={handleSubmit} className="new-item-form">
      <div className="flex flex-col gap-[0.1rem]">
        <label htmlFor="item">New Todo</label>
        <input
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          type="text"
          id="item"
          className="outline-none border-[1px] border-[hsl(200, 100%, 40%)] border-gray-300 rounded-md p-1"
        />
      </div>
      <button className="btn">Add</button>
    </form>
  )
}
