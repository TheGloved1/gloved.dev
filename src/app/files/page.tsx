import FileUploader from '@/components/FileUploader';
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
      <div className='flex flex-col items-center justify-center gap-12 self-center px-4 py-32'>
        <FileUploader />
      </div>
    </>
  );
}
