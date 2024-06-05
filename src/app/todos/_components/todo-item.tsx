type TodoItemProps = {
  completed: boolean
  id: string
  title: string
  toggleTodo: (id: string, completed: boolean) => void
  deleteTodo: (id: string) => void
}


export function TodoItem({ completed, id, title, toggleTodo, deleteTodo }: TodoItemProps) {
  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={completed}
          onChange={e => toggleTodo(id, e.target.checked)}
        />
        {title}
      </label>
      <button onClick={() => deleteTodo(id)} className="btn btn-danger">
        Delete
      </button>
    </li>
  )
}
