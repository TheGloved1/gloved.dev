import PageBack from '@/components/PageBack';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import React from 'react';
import TodoPage from './_components/todo-page';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.Todos.title,
  description: Constants.Todos.description,
};

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className='h-dvh w-dvw'>
        <PageBack />
        <TodoPage />
      </div>
    </>
  );
}
