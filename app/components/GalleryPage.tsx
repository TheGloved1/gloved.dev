import React, { useState } from 'react'
import ChevronLeft from '@/components/ChevronLeft'
import { Link } from '@remix-run/react'
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios'
import { apiRoute } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button from './Buttons'

interface GalleryFileInfo {
  name: string
  createdAt: string
  size: string
}

const fetchGallery = async () => {
  const response: AxiosResponse<GalleryFileInfo[]> = await axios.get(apiRoute('/files/?gallery=true'))
  return response.data
}

const uploadFileApi = async (file: File, onUploadProgress: (progressEvent: AxiosProgressEvent) => void) => {
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

export default function Gallery(): React.JSX.Element {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadFileApi(file, (progressEvent) => {
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

  const galleryQuery = useQuery<GalleryFileInfo[], Error>({ queryKey: ['gallery'], queryFn: fetchGallery, initialData: [] })

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    try {
      const files = event.target.files
      if (!files || files.length === 0) {
        console.error('No files found!')
        return
      }
      const file = files[0]
      if (!file) return

      await uploadMutation.mutate(file)
    } catch (error) {
      console.error('An error occurred while uploading file:', error)
    }
  }

  return (
    <>
      <main className='flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white'>
        <Link
          to={'/'}
          className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 md:bottom-auto md:top-2'
        >
          <button className='btn flex flex-row items-center justify-center'>
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <div className='top-2 flex flex-col items-center justify-center p-4 pt-16'>
          <div className='top-2 flex flex-col items-center justify-center'>
            <h1 className='text-2xl'>Gallery</h1>
            <h2 className='text-md pb-4'>A tribute to my best friend</h2>
            <p className='pb-12 text-xs'>{'(Currently only images are supported, will add videos later)'}</p>
          </div>
          {galleryQuery.isLoading ?
            <p>Loading...</p>
          : <div className='flex flex-wrap justify-center gap-4'>
              {galleryQuery.data.map((file) => (
                <div key={file.name} className='flex flex-col items-center justify-center'>
                  <img
                    src={apiRoute(`/files/download/${file.name}?gallery=true`)}
                    alt={file.name}
                    className='max-h-64 max-w-64'
                  />
                </div>
              ))}
            </div>
          }
        </div>
        <input
          id='uploadBtn'
          className='glass file-input file-input-primary fixed bottom-2 max-w-80 rounded-xl bg-black hover:animate-pulse'
          type='file'
          accept='image/*'
          onChange={uploadFile}
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
