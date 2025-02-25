export function TodoItem(props: {
  completed: boolean;
  id: string;
  title: string;
  toggleTodo: (id: string, completed: boolean) => void;
  deleteTodo: (id: string) => void;
}): React.JSX.Element {
  return (
    <li>
      <label>
        <input type='checkbox' checked={props.completed} onChange={(e) => props.toggleTodo(props.id, e.target.checked)} />
        {props.title}
      </label>
      <button onClick={() => props.deleteTodo(props.id)} className='btn-danger btn'>
        Delete
      </button>
    </li>
  );
}
