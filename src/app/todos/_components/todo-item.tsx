export function TodoItem(props: {
  completed: boolean
  id: string
  title: string
  toggleTodo: (id: string, completed: boolean) => void
  deleteTodo: (id: string) => void
}) {
  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={props.completed}
          onChange={e => props.toggleTodo(props.id, e.target.checked)}
        />
        {props.title}
      </label>
      <button onClick={() => props.deleteTodo(props.id)} className="btn btn-danger">
        Delete
      </button>
    </li>
  )
}
