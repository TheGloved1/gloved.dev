import './styles.css'
import React, { useEffect, useState } from 'react'
import TodoList from './todo-list'
import NewTodoForm from './new-todo-form'

export type Todo = {
  id: string
  title: string
  completed: boolean
}

const todo_key = 'TODO_ITEMS'

export default function TodoPage(): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === 'undefined') return []
    const localValue = localStorage.getItem(todo_key)
    if (localValue == null) return []
    return JSON.parse(localValue) as Todo[]
  })

  useEffect(() => {
    localStorage.setItem(todo_key, JSON.stringify(todos))
  }, [todos])

  function addTodo(title: string): void {
    setTodos((currentTodos) => {
      return [...currentTodos, { id: crypto.randomUUID(), title, completed: false }]
    })
  }

  function toggleTodo(id: string, completed: boolean): void {
    setTodos((currentTodos) => {
      return currentTodos.map((todo) => {
        if (todo.id === id) {
          return { ...todo, completed }
        }
        return todo
      })
    })
  }

  function deleteTodo(id: string): void {
    setTodos((currentTodos) => {
      return currentTodos.filter((todo) => todo.id !== id)
    })
  }

  return (
    <>
      <main className='main place-items-center'>
        <NewTodoForm onSubmit={addTodo} />
        <h1 className='mb-2 mt-6 text-[1.5rem]'>Todo List</h1>
        <TodoList todos={todos} toggleTodo={toggleTodo} deleteTodo={deleteTodo} />
      </main>
    </>
  )
}
