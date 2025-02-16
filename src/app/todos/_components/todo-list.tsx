import { TodoItem } from './todo-item'
import { type Todo } from './todo-page'

export default function TodoList(props: {
  todos: Todo[]
  toggleTodo: (id: string, completed: boolean) => void
  deleteTodo: (id: string) => void
}): React.JSX.Element {
  return (
    <ul className='list'>
      {props.todos.length === 0 && 'No Todos'}
      {props.todos.map((todo) => {
        return (
          <TodoItem
            {...todo}
            key={todo.id}
            toggleTodo={props.toggleTodo}
            deleteTodo={props.deleteTodo}
          />
        )
      })}
    </ul>
  )
}
