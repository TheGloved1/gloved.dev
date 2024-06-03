"use client"
import { useEffect, useState } from "react"
import NewTodoForm from "./NewTodoForm"
import "./styles.css"
import { TodoList } from "./TodoList"

export type Todo = {
  id: string
  title: string
  completed: boolean
}

const todo_key = "TODO_ITEMS"

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === "undefined") return []
    const localValue = localStorage.getItem(todo_key)
    if (localValue == null) return []
    return JSON.parse(localValue) as Todo[]
  })

  useEffect(() => {
    localStorage.setItem(todo_key, JSON.stringify(todos))
  }, [todos])

  function addTodo(title: string) {
    setTodos(currentTodos => {
      return [
        ...currentTodos,
        { id: crypto.randomUUID(), title, completed: false },
      ]
    })
  }

  function toggleTodo(id: string, completed: boolean) {
    setTodos(currentTodos => {
      return currentTodos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed }
        }
        return todo
      })
    })
  }

  function deleteTodo(id: string) {
    setTodos(currentTodos => {
      return currentTodos.filter(todo => todo.id !== id)
    })
  }

  return (
    <>
      <main className="main place-items-center">
        <NewTodoForm onSubmit={addTodo} />
        <h1 className="text-[1.5rem] mt-6 mb-2">Todo List</h1>
        <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
      </main>
    </>
  )
}
