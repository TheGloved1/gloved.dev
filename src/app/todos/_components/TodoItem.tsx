'use client';
import { Input } from '@/components/ui/input';
import React, { useCallback, useEffect, useRef } from 'react';
import type { Todo } from './todo-page';

interface TodoItemProps {
  todo: Todo;
  editingId: string | null;
  editText: string;
  onToggle: (id: string) => void;
  onStartEdit: (todo: Todo) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditTextChange: (text: string) => void;
}

function TodoItemComponent({
  todo,
  editingId,
  editText,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditTextChange,
}: TodoItemProps): React.JSX.Element {
  const editRef = useRef<HTMLInputElement>(null);
  const isEditing = editingId === todo.id;

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onSaveEdit();
      if (e.key === 'Escape') onCancelEdit();
    },
    [onSaveEdit, onCancelEdit],
  );

  return (
    <li className='group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.02]'>
      <button
        onClick={() => onToggle(todo.id)}
        aria-label={`Toggle ${todo.title}`}
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          todo.completed ? 'border-fuchsia-500 bg-fuchsia-500' : 'border-white/30 hover:border-fuchsia-500/60'
        }`}
      >
        {todo.completed && (
          <svg className='h-2.5 w-2.5 text-black' fill='none' viewBox='0 0 12 12' stroke='currentColor' strokeWidth={3}>
            <path strokeLinecap='round' strokeLinejoin='round' d='M2 6l3 3 5-5' />
          </svg>
        )}
      </button>
      {isEditing ?
        <>
          <Input
            ref={editRef}
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className='font-mono-industrial h-7 flex-1 border-fuchsia-500/50 bg-fuchsia-500/5 text-xs text-white'
          />
          <button
            onClick={onSaveEdit}
            aria-label='Save'
            className='brutal-shadow-sm flex h-7 w-7 items-center justify-center rounded-lg border border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20'
          >
            <svg className='h-3 w-3' fill='none' viewBox='0 0 12 12' stroke='currentColor' strokeWidth={3}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M2 6l3 3 5-5' />
            </svg>
          </button>
          <button
            onClick={onCancelEdit}
            aria-label='Cancel'
            className='brutal-shadow-sm flex h-7 w-7 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white/50 hover:border-white/40 hover:bg-white/10'
          >
            <svg className='h-3 w-3' fill='none' viewBox='0 0 12 12' stroke='currentColor' strokeWidth={3}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M2 2l8 8M10 2l-8 8' />
            </svg>
          </button>
        </>
      : <button onClick={() => onStartEdit(todo)} className='flex flex-1 items-center text-left'>
          <span
            className={`font-mono-industrial flex-1 text-sm transition-colors ${
              todo.completed ? 'text-white/30 line-through' : 'text-white/80'
            }`}
          >
            {todo.title}
          </span>
        </button>
      }
      {!isEditing && (
        <div className='relative h-7 w-16'>
          <button
            onClick={() => onStartEdit(todo)}
            aria-label='Edit'
            className='absolute right-0 flex h-7 w-7 items-center justify-center text-white/20 transition-all duration-200 hover:text-white/50 group-hover:right-9'
          >
            <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            aria-label='Delete'
            className='brutal-shadow-sm pointer-events-none absolute right-0 flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 opacity-0 transition-all duration-200 hover:border-red-500/60 hover:bg-red-500/20 group-hover:pointer-events-auto group-hover:opacity-100'
          >
            <svg className='h-3 w-3' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
          </button>
        </div>
      )}
    </li>
  );
}

export default React.memo(TodoItemComponent);
