import FileUploader from '@/app/files/_components/FileUploader';
import PageBack from '@/components/PageBack';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.FileUploader.title}`,
  description: Constants.FileUploader.description,
};

export default function Page(): React.JSX.Element {
  return (
    <>
      <PageBack />
      <div className='flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
        <div className='noise-overlay' />
        <main className='grid-pattern flex-1 overflow-hidden px-4 py-4 lg:px-6'>
          <div className='flex h-full items-center justify-center'>
            <FileUploader />
          </div>
        </main>
      </div>
    </>
  );
}
