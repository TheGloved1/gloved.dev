'use client'
import Button, { RedButton } from '@/components/Buttons'
import Loading from '@/components/loading'
import PageBack from '@/components/PageBack'
import { apiRoute } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

type GalleryFile = {
  name: string
  createdAt: string
  size: string
}

async function fetchGallery() {
  const response: AxiosResponse<GalleryFile[]> = await axios.get(apiRoute('/files/?gallery=true'))

  // Sort by numeric index in the filename
  const sortedFiles: GalleryFile[] = response.data.sort((a, b) => {
    const indexA = extractIndexFromFilename(a.name)
    const indexB = extractIndexFromFilename(b.name)
    return indexA - indexB // Ascending order
  })

  return sortedFiles
}

// Helper function to extract index from filename
function extractIndexFromFilename(filename: string): number {
  const match = filename.match(/gallery_(\d+)/)
  return match ? parseInt(match[1], 10) : 0 // Default to 0 if no match
}

async function galleryUploadApi(file: File, onUploadProgress: (progressEvent: AxiosProgressEvent) => void) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('gallery', 'true')
  await axios.post(apiRoute('/files/upload'), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
}

async function galleryDeleteApi(file: string) {
  console.log('Deleting file:', file)
  await axios.delete(apiRoute(`/files/delete/${file}?gallery=true`))
}

export default function Gallery(): React.JSX.Element {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 768)
  const inputButton = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      galleryUploadApi(file, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      setUploadProgress(0)
    },
  })

  const galleryQuery = useQuery<GalleryFile[], Error>({
    queryKey: ['gallery'],
    queryFn: fetchGallery,
    initialData: [],
  })

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    queryClient.invalidateQueries({ queryKey: ['gallery'] })
    try {
      const files = event.target.files
      if (!files || files.length === 0) {
        console.error('No files found!')
        return
      }

      // Iterate over each file and upload it
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        uploadMutation.mutate(file)
      }

      // Clear the input field after uploading
      if (inputButton.current) {
        inputButton.current.value = ''
      }
    } catch (error) {
      console.error('An error occurred while uploading file:', error)
    }
  }

  async function deleteFile(file: string) {
    await galleryDeleteApi(file)
    queryClient.invalidateQueries({ queryKey: ['gallery'] })
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    }, 5000)
  }

  return (
    <>
      <main className='flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white'>
        <PageBack />
        <button
          className='btn btn-circle btn-sm fixed right-2 top-2 hover:animate-spin'
          onClick={() => queryClient.invalidateQueries({ queryKey: ['gallery'] })}
          title='Refresh Files'
        >
          ↻
        </button>
        <div className='flex w-screen flex-col items-center justify-center p-4 pt-16'>
          <div className='flex scale-50 flex-col items-center justify-center text-center sm:scale-75 md:scale-100'>
            <h1 className='text-2xl'>Gallery</h1>
            <h2 className='text-md pb-4'>A tribute to my best friend</h2>
            <p className='pb-12 text-center text-xs'>{'(Currently only images are supported, will add videos later)'}</p>
          </div>
          {galleryQuery.isFetching ?
            <Loading />
          : galleryQuery.data.length === 0 ?
            <div className='flex w-screen flex-wrap justify-center'>
              <p>No files found.</p>
            </div>
          : <div className='flex w-screen flex-wrap justify-center'>
              {galleryQuery.data.map((file) => (
                <div
                  key={file.name}
                  className='group relative flex h-24 w-24 flex-col items-center justify-center border-2 border-dashed border-slate-500 sm:h-32 sm:w-32 md:h-48 md:w-48'
                >
                  <Link
                    href={apiRoute(`/files/download/${file.name}?gallery=true`)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='relative flex h-24 w-24 flex-col items-center justify-center border-2 border-dashed border-slate-500 sm:h-32 sm:w-32 md:h-48 md:w-48'
                  >
                    <Image
                      src={`${apiRoute(`/files/download/${file.name}?gallery=true`)}`}
                      alt={file.name}
                      className='bottom-0 left-0 right-0 top-0 max-h-full max-w-full cursor-pointer rounded-xl object-center p-2'
                      title={'Download ' + file.name}
                      width={125}
                      height={125}
                      placeholder='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFc90AAAADUlEQVQYV2NkYGAAYRgDf9hKJgAAAABJRU5ErkJggg=='
                    />
                  </Link>
                  {windowWidth >= 768 && (
                    <RedButton
                      className='absolute right-2 top-2 opacity-0 group-hover:opacity-100'
                      onClick={() => deleteFile(file.name)}
                      title={`Delete file ${galleryQuery.data.findIndex((f) => f.name === file.name) + 1} of ${
                        galleryQuery.data.length
                      }`}
                    >
                      X
                    </RedButton>
                  )}
                </div>
              ))}
            </div>
          }
        </div>
        <input
          id='uploadBtn'
          ref={inputButton}
          className='glass file-input file-input-primary fixed bottom-2 top-auto max-h-80 max-w-80 scale-50 rounded-xl bg-black text-xs hover:animate-pulse sm:scale-75 md:scale-100'
          type='file'
          accept='image/*'
          onChange={uploadFile}
          multiple
        />
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className='mt-2 w-full'>
            <progress className='progress progress-primary w-full' value={uploadProgress} max='100' />
            <Button onClick={() => uploadMutation.reset()}>Cancel</Button>
            <p className='text-center'>{`Uploading: ${uploadProgress}%`}</p>
          </div>
        )}
      </main>
    </>
  )
}
