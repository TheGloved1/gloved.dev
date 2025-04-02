import PageBack from '@/components/PageBack';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.White.title,
  description: Constants.White.description,
};

export default function Page(): React.JSX.Element {
  return (
    <main className='flex min-h-screen w-screen flex-col items-center justify-center bg-white text-black'>
      <PageBack />
      <p className='rounded-xl bg-neutral-400 p-2 text-sm text-neutral-900'>{"This is a white screen... that's it."}</p>
    </main>
  );
}
