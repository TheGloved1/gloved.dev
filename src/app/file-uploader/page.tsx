import React from 'react'
import FileUploader from '@/components/FileUploader'
import ChevronLeft from '@/components/ChevronLeft'
import { Metadata } from 'next'
import { NAME } from '@/lib/constants'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `${NAME} | File Uploader`,
  description: 'Just the simple file uploader from the home page.',
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white">
        <Link
          href={'/home'}
          className="fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2"
        >
          <button className="btn flex flex-row items-center justify-center">
            <ChevronLeft />
            {'Home'}
          </button>
        </Link>
        <div className="flex flex-col items-center justify-center gap-12 self-center px-4 py-32">
          <FileUploader />
        </div>
      </main>
    </>
  )
}
