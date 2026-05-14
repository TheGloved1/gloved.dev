'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckSquare, ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(TODO_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    if (editingId) editRef.current?.focus();
  }, [editingId]);

  const startEditing = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  }, []);

  const saveEdit = useCallback(() => {
    const id = editingId;
    const title = editText.trim();
    if (!id || !title) {
      setEditingId(null);
      return;
    }
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
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
                <li
                  key={todo.id}
                  className='group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.02]'
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      todo.completed ? 'border-fuchsia-500 bg-fuchsia-500' : 'border-white/30 hover:border-fuchsia-500/60'
                    }`}
                  >
                    {todo.completed && (
                      <svg
                        className='h-2.5 w-2.5 text-black'
                        fill='none'
                        viewBox='0 0 12 12'
                        stroke='currentColor'
                        strokeWidth={3}
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M2 6l3 3 5-5' />
                      </svg>
                    )}
                  </button>
                  {editingId === todo.id ?
                    <>
                      <Input
                        ref={editRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className='font-mono-industrial h-7 flex-1 border-fuchsia-500/50 bg-fuchsia-500/5 text-xs text-white'
                      />
                      <button
                        onClick={saveEdit}
                        className='brutal-shadow-sm flex h-7 w-7 items-center justify-center rounded-lg border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20'
                      >
                        <svg className='h-3 w-3' fill='none' viewBox='0 0 12 12' stroke='currentColor' strokeWidth={3}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M2 6l3 3 5-5' />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className='brutal-shadow-sm flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white/50 hover:border-white/40 hover:bg-white/10'
                      >
                        <svg className='h-3 w-3' fill='none' viewBox='0 0 12 12' stroke='currentColor' strokeWidth={3}>
                          <path strokeLinecap='round' strokeLinejoin='round' d='M2 2l8 8M10 2l-8 8' />
                        </svg>
                      </button>
                    </>
                  : <button onClick={() => startEditing(todo)} className='flex flex-1 items-center text-left'>
                      <span
                        className={`font-mono-industrial flex-1 text-sm transition-colors ${
                          todo.completed ? 'text-white/30 line-through' : 'text-white/80'
                        }`}
                      >
                        {todo.title}
                      </span>
                    </button>
                  }
                  {editingId !== todo.id && (
                    <div className='relative h-7 w-16'>
                      <button
                        onClick={() => startEditing(todo)}
                        className='absolute right-0 flex h-7 w-7 items-center justify-center text-white/20 transition-all duration-200 hover:text-white/50 group-hover:right-9'
                      >
                        <Pencil className='h-3.5 w-3.5' />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className='brutal-shadow-sm pointer-events-none absolute right-0 flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 opacity-0 transition-all duration-200 hover:border-red-500/60 hover:bg-red-500/20 group-hover:pointer-events-auto group-hover:opacity-100'
                      >
                        <Trash2 className='h-3 w-3' />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
}
