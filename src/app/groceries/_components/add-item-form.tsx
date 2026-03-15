'use client';
import { ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

interface AddItemFormProps {
  listKey: 'shopping-list' | 'have-list';
  onAddItem: (listKey: 'shopping-list' | 'have-list', text: string) => void;
  isLoading?: boolean;
}

export default function AddItemForm({ listKey, onAddItem, isLoading = false }: AddItemFormProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      onAddItem(listKey, inputValue.trim());
      setInputValue('');
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='relative'>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Add an item to list...'
          className='w-full rounded-t-xl border-2 border-red-900/30 bg-black px-4 py-4 text-lg text-red-300 transition-colors placeholder:text-red-600/50 focus:border-red-500/50 focus:outline-none'
          maxLength={100}
          disabled={isSubmitting || isLoading}
        />
        <div className='absolute right-3 top-1/2 -translate-y-1/2 transform'>
          <div className='text-xs text-red-600/50'>{inputValue.length}/100</div>
        </div>
        <button
          type='submit'
          className='touch-manipulation-none min-h-[48px] w-full rounded-b-xl bg-red-600 py-3 text-base font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
          disabled={!inputValue.trim() || isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ?
            !inputValue.trim() ?
              <div className='flex items-center justify-center'>
                <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                <span className='ml-2'>Adding...</span>
              </div>
            : `Add to ${listKey === 'shopping-list' ? 'Shopping List' : 'Have List'}`
          : inputValue.trim() ?
            `Add to ${listKey === 'shopping-list' ? 'Shopping List' : 'Have List'}`
          : <span className='flex items-center justify-center gap-1'>
              <ChevronUp className='h-4 w-4' /> Type Item Name Above <ChevronUp className='h-4 w-4' />
            </span>
          }
        </button>
      </div>
    </form>
  );
}
