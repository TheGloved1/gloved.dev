import { Metadata } from 'next';
import React from 'react';
import GroceryPage from './_components/grocery-page';

export const metadata: Metadata = {
  title: 'Hood House Groceries',
  description: 'An editable shopping list that syncs between users',
};

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className='h-dvh w-dvw'>
        <GroceryPage />
      </div>
    </>
  );
}
