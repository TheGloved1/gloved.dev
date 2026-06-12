'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckSquare, ChevronLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import TodoItem from './TodoItem';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

const TODO_KEY = 'TODO_ITEMS';

export default function TodoPage(): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>(() => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(TODO_KEY);
    if (raw == null) return [];
    return JSON.parse(raw) as Todo[];
  });
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const id = setTimeout(() => localStorage.setItem(TODO_KEY, JSON.stringify(todos)), 300);
    return () => clearTimeout(id);
  }, [todos]);

  const startEditing = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId === null) return;
    const title = editText.trim();
    if (!title) {
      setEditingId(null);
      return;
    }
    setTodos((prev) => prev.map((t) => (t.id === editingId ? { ...t, title } : t)));
    setEditingId(null);
    toast.success('Todo updated');
  }, [editingId, editText]);

  function addTodo(): void {
    const title = newTitle.trim();
    if (!title) return;
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), title, completed: false }]);
    setNewTitle('');
    toast.success('Todo added');
  }

  function toggleTodo(id: string): void {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTodo(id: string): void {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success('Todo deleted');
  }

  return (
    <div className='relative flex min-h-screen flex-col items-center bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <div className='grid-pattern pointer-events-none fixed inset-0' />
      <div className='noise-overlay' />

      <Link
        href={'/'}
        onClick={(e) => {
          e.preventDefault();
          if (window.history.length > 1) window.history.back();
          else window.location.href = '/';
        }}
        className='fixed left-3 top-3 z-50'
      >
        <Button className='brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs text-white hover:bg-fuchsia-500/20'>
          <ChevronLeft className='h-4 w-4' />
          <span className='hidden sm:block'>Back</span>
        </Button>
      </Link>

      <div className='mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 overflow-hidden px-4 pb-4 pt-14'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10'>
            <CheckSquare className='h-5 w-5 text-fuchsia-500' />
          </div>
          <div>
            <h1 className='font-display text-xl font-bold uppercase tracking-tight text-white'>Todos</h1>
            <p className='font-mono-industrial text-[10px] text-white/50'>Local storage task manager</p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTodo();
          }}
          className='shrink-0 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'
        >
          <h2 className='font-display mb-3 text-[11px] font-bold uppercase tracking-wide text-white/70'>New Todo</h2>
          <div className='flex gap-2'>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder='What needs to be done?'
              className='font-mono-industrial h-8 flex-1 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus:border-fuchsia-500 focus:bg-fuchsia-500/5'
            />
            <Button
              type='submit'
              disabled={!newTitle.trim()}
              className='brutal-shadow-sm h-8 border border-fuchsia-500/50 bg-fuchsia-500/10 text-[10px] text-white hover:bg-fuchsia-500/20'
            >
              <Plus className='mr-1 h-3 w-3' />
              Add
            </Button>
          </div>
        </form>

        <div className='flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
          <h2 className='font-display mb-3 shrink-0 text-[11px] font-bold uppercase tracking-wide text-white/70'>Tasks</h2>
          {todos.length === 0 ?
            <div className='flex flex-1 items-center justify-center'>
              <p className='font-mono-industrial text-sm text-white/20'>No todos yet</p>
            </div>
          : <ul className='flex-1 space-y-1 overflow-y-auto'>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  editingId={editingId}
                  editText={editText}
                  onToggle={toggleTodo}
                  onStartEdit={startEditing}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={deleteTodo}
                  onEditTextChange={setEditText}
                />
              ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
}
