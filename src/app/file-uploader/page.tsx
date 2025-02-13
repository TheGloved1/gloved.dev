import FileUploader from '@/components/FileUploader'
import PageBack from '@/components/PageBack'
import { NAME } from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: `${NAME} | File Uploader`,
  description: 'Just the simple file uploader from the home page.',
}

export default function Page(): React.JSX.Element {
  return (
    <>
        <PageBack />
        <div className='flex flex-col items-center justify-center gap-12 self-center px-4 py-32'>
          <FileUploader />
      </div>
    </>
  )
}
