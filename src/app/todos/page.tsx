// import Link from 'next/link'
import React, {
  // useEffect,
  // useState
} from 'react'
import { CreateTodo } from '../_components/create-todo'
//  TODO: Make a seperate TODO react app to keep track of all the things I need to do.

export default function Page() {
  console.log('Rendering Home...')

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e526d] to-[#1e210c] text-white">
      <CrudShowcase />
    </main>
  )

}

function CrudShowcase() {
  return (
    <div>
      <CreateTodo />
    </div>
  )
}
