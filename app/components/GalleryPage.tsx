import React, { useRef, useState } from 'react'
import ChevronLeft from '@/components/ChevronLeft'
import { Link } from '@remix-run/react'
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios'
import { apiRoute } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Button, { RedButton } from './Buttons'
import Loading from './loading'

interface GalleryFileInfo {
  name: string
  createdAt: string
  size: string
}

const fetchGallery = async () => {
  const response: AxiosResponse<GalleryFileInfo[]> = await axios.get(apiRoute('/files/?gallery=true'))
  return response.data
}

const galleryUploadApi = async (file: File, onUploadProgress: (progressEvent: AxiosProgressEvent) => void) => {
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

const galleryDeleteApi = async (file: string) => {
  console.log('Deleting file:', file)
  await axios.delete(apiRoute(`/files/permanent-delete/${file}?gallery=true`))
}

export default function Gallery(): React.JSX.Element {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const inputButton = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

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

  const galleryQuery = useQuery<GalleryFileInfo[], Error>({ queryKey: ['gallery'], queryFn: fetchGallery, initialData: [] })

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    queryClient.invalidateQueries({ queryKey: ['gallery'] })
    try {
      const files = event.target.files
      if (!files || files.length === 0) {
        console.error('No files found!')
        return
      }
      const file = files[0]
      if (!file) return

      await uploadMutation.mutate(file)
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
  }

  return (
    <>
      <main className='flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white'>
        <Link
          to={'/'}
          className='fixed left-2 top-2 flex scale-50 flex-row items-center justify-center pl-0 sm:scale-75 md:bottom-auto md:scale-100'
        >
          <button className='btn flex flex-row items-center justify-center'>
            <ChevronLeft />
            {'Back'}
          </button>
        </Link>
        <div className='flex flex-col items-center justify-center p-4 pt-16'>
          <div className='flex scale-50 flex-col items-center justify-center text-center sm:scale-75 md:scale-100'>
            <h1 className='text-2xl'>Gallery</h1>
            <h2 className='text-md pb-4'>A tribute to my best friend</h2>
            <p className='pb-12 text-center text-xs'>{'(Currently only images are supported, will add videos later)'}</p>
          </div>
          {galleryQuery.isPending || galleryQuery.isFetching || galleryQuery.isRefetching ?
            <Loading />
          : <div className='flex w-full scale-50 flex-wrap justify-center sm:scale-75 md:scale-100'>
              {galleryQuery.data.map((file) => (
                <div
                  key={file.name}
                  className='group relative flex h-48 w-48 flex-col items-center justify-center border-2 border-dashed border-slate-500'
                >
                  <img
                    src={apiRoute(`/files/download/${file.name}?gallery=true`)}
                    alt={file.name}
                    className='bottom-0 left-0 right-0 top-0 max-h-full max-w-full cursor-pointer rounded-xl object-center p-2'
                  />
                  <RedButton
                    className='absolute right-2 top-2 opacity-0 group-hover:opacity-100'
                    onClick={() => deleteFile(file.name)}
                    title={`Delete file ${galleryQuery.data.findIndex((f) => f.name === file.name) + 1}/${galleryQuery.data.length}`}
                  >
                    X
                  </RedButton>
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
