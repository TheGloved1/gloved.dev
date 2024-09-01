/** @format */

import React, { Suspense } from 'react'
import FileUploader from '@/components/file-uploader'
import { type Metadata } from 'next'
import ChevronLeft from '@/components/chevron-left'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'gloved.dev | File Uploader',
  description: 'Just the simple file uploader from the home page.',
}

export default function Page(): React.JSX.Element {
  console.log('Rendering FileManager...')
  return (
    <>
      <main className='flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white'>
        <Link href={'/'} className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2'>
          <button className='btn flex flex-row items-center justify-center'>
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <div className='flex flex-col items-center justify-center gap-12 px-4 py-32'>
          <FileUploader />
        </div>
      </main>
    </>
  )
}
