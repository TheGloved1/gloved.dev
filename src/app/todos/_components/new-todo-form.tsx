import { useState } from 'react';

export default function NewTodoForm(props: { onSubmit: (title: string) => void }): React.JSX.Element {
  const [newItem, setNewItem] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (newItem === '') return;

    props.onSubmit(newItem);

    setNewItem('');
  }

  return (
    <form onSubmit={handleSubmit} className='new-item-form'>
      <div className='flex flex-col gap-[0.1rem]'>
        <label htmlFor='item'>New Todo</label>
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          type='text'
          id='item'
          className='border-[hsl(200, 100%, 40%)] rounded-md border-[1px] border-gray-300 p-1 outline-none'
        />
      </div>
      <button className='btn'>Add</button>
    </form>
  );
}
