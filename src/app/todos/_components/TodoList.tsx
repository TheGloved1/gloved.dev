import { TodoItem } from "./TodoItem"
import { type Todo } from "./TodoPage"

type TodoListProps = {
  todos: Todo[]
  toggleTodo: (id: string, completed: boolean) => void
  deleteTodo: (id: string) => void
}

export function TodoList({ todos, toggleTodo, deleteTodo }: TodoListProps) {
  return (
    <ul className="list">
      {todos.length === 0 && "No Todos"}
      {todos.map(todo => {
        return (
          <TodoItem
            {...todo}
            key={todo.id}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
          />
        )
      })}
    </ul>
  )
}
