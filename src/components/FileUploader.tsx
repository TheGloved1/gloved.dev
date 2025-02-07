'use client'
import Dialog from '@/components/Dialog'
import ErrorAlert from '@/components/ErrorAlert'
import FileButton from '@/components/FileButton'
import Loading from '@/components/loading'
import { env } from '@/env'
import { apiRoute, safeAwait } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios, { type AxiosProgressEvent, type AxiosResponse } from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import Button, { RedButton } from './Buttons'

type FileInfo = {
  name: string
  isTemp: boolean
  createdAt: string
  size: string
}

const fetchFiles = async (): Promise<FileInfo[]> => {
  const response: AxiosResponse<FileInfo[]> = await axios.get(apiRoute('/files/'))
  return response.data
}

const deleteFileApi = async (file: string, isTemp: boolean) => {
  await axios.delete(apiRoute(`/files/delete/${file}?temp=${isTemp}`))
}

const permanentDeleteFileApi = async (file: string, isTemp: boolean) => {
  await axios.delete(apiRoute(`/files/permanent-delete/${file}?temp=${isTemp}`))
}

const uploadFileApi = async (
  file: File,
  isTemp: boolean,
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
  signal?: AbortSignal,
) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('temp', isTemp.toString())
  await axios.post(apiRoute('/files/upload'), formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
    signal: signal,
  })
}

export default function FileUploader(): React.JSX.Element {
  const queryClient = useQueryClient()
  const correctPassword = env.NEXT_PUBLIC_FILE_MANAGER_PASSKEY
  const [alert, setAlert] = useState<string>('')
  const [passwordEntered, setPasswordEntered] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isTemp, setIsTemp] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const inputButton = useRef<HTMLInputElement>(null)
  const [fileToDelete, setFileToDelete] = useState<{ name: string; isTemp: boolean } | null>(null)
  const [isPermanentDelete, setIsPermanentDelete] = useState<boolean>(false)
  const [uploadRequest, setUploadRequest] = useState<AbortController | null>(null)

  const filesKey = 'files'

  const filesQuery = useQuery({ queryKey: [filesKey], queryFn: fetchFiles, initialData: [] })

  const deleteMutation = useMutation({
    mutationFn: ({ file, isTemp }: { file: string; isTemp: boolean }) => deleteFileApi(file, isTemp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [filesKey] })
    },
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: ({ file, isTemp }: { file: string; isTemp: boolean }) => permanentDeleteFileApi(file, isTemp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [filesKey] })
    },
  })

  const handleCancelUpload = () => {
    if (uploadRequest) {
      uploadRequest.abort()
      setUploadProgress(0)
      setUploadRequest(null)
    }
  }

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const controller = new AbortController()
      setUploadRequest(controller)

      return uploadFileApi(
        file,
        isTemp,
        (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percentCompleted)
          }
        },
        controller.signal,
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [filesKey] })
      setUploadProgress(0)
      setUploadRequest(null)
      if (inputButton.current) {
        inputButton.current.value = ''
      }
    },
  })

  useEffect(() => {
    setPasswordEntered(window.localStorage.getItem('fileUploaderPasswordEntered') === correctPassword)
  }, [correctPassword])

  useEffect(() => {
    if (alert === '') return
    const timer = setTimeout(() => {
      setAlert('')
    }, 2500)
    return () => clearTimeout(timer)
  }, [alert])

  async function handleDelete(permanent: boolean = false): Promise<void> {
    if (!fileToDelete) return
    if (!passwordEntered) {
      const password = prompt(`Enter passkey to delete files`)
      if (!password) {
        return
      }
      if (password.trim() === correctPassword) {
        window.localStorage.setItem('fileUploaderPasswordEntered', correctPassword)
        setPasswordEntered(true)
      } else {
        setAlert('Incorrect passkey')
        return
      }
    }

    if (permanent) {
      const [_, error] = await safeAwait(
        permanentDeleteMutation.mutateAsync({ file: fileToDelete.name, isTemp: fileToDelete.isTemp }),
      )
      if (error) {
        setAlert(error.message)
        return
      }
    } else {
      const [_, error] = await safeAwait(deleteMutation.mutateAsync({ file: fileToDelete.name, isTemp: fileToDelete.isTemp }))
      if (error) {
        setAlert(error.message)
        return
      }
    }
    setAlert('')
    setIsDeleteDialogOpen(false)
    setFileToDelete(null)
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    try {
      const files = event.target.files
      if (!files || files.length === 0) {
        console.error('No files found!')
        setAlert('No files found!')
        return
      }
      const file = files[0]
      if (!file) return

      uploadMutation.mutate(file)
      setAlert('')
    } catch (error) {
      console.error('An error occurred while uploading file:', error)
      setAlert('An error occurred while uploading file')
    }
  }

  return (
    <>
      <div className='flex flex-col items-center justify-center self-center rounded-xl border-4 border-white bg-gray-700/50 p-4 text-[10px] md:text-[1rem]'>
        <h1 className='font-bold'>{'Simple File Uploader'}</h1>
        <p className='text-[0.5rem] md:text-sm'>{"(Don't download random files off the internet)"}</p>
        <br />

        <label htmlFor='uploadBtn' className='label mt-2 pt-2'>
          {'Upload File'}
        </label>
        <div className='form-control'>
          <label className='label m-2 cursor-pointer rounded-xl bg-gray-600 p-2 text-black hover:bg-gray-700'>
            <span className='label-text text-balance'>{'Temporary file (24h)'}</span>
            <span className='w-2'></span>
            <input type='checkbox' checked={isTemp} onChange={(e) => setIsTemp(e.target.checked)} className='checkbox' />
          </label>
        </div>
        <input
          id='uploadBtn'
          ref={inputButton}
          className='glass file-input file-input-primary max-w-80 rounded-xl bg-black hover:animate-pulse'
          type='file'
          onChange={uploadFile}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className='mt-2 w-full'>
            <progress className='progress progress-primary w-full' value={uploadProgress} max='100' />
            <p className='text-center'>{`Uploading: ${uploadProgress}%`}</p>
            <Button onClick={handleCancelUpload}>Cancel</Button>
          </div>
        )}

        <h2 className='place-items-center content-center justify-center pb-4 pt-4 text-center'>
          {'Download Files '}
          <button
            className='btn btn-circle btn-sm hover:animate-spin'
            onClick={() => queryClient.invalidateQueries({ queryKey: [filesKey] })}
            title='Refresh Files'
          >
            ↻
          </button>
        </h2>
        <h3 className='rounded-2xl bg-gray-500 bg-opacity-50 px-2 py-1 text-sm underline'>
          {'(Click file to Copy or Download)'}
        </h3>

        {filesQuery.isLoading && <Loading />}
        {!filesQuery.isLoading && filesQuery.data.length > 0 && (
          <>
            {filesQuery.data.some((file) => file.isTemp) && <h4>Permanent Files</h4>}
            <ul className='flex max-h-48 max-w-96 flex-col flex-wrap overflow-x-auto rounded-xl border-2 border-white p-[.2rem] md:max-h-60 lg:max-h-72'>
              {filesQuery.isError ?
                <div className='alert alert-error'>An error occurred while fetching files.</div>
              : filesQuery.data
                  .filter((file) => !file.isTemp)
                  .map((file) => (
                    <li className='flex w-64 flex-row p-1 text-[.2rem]' key={file.name}>
                      <FileButton file={file.name} size={file.size} />
                      <RedButton
                        disabled={false}
                        onClick={() => {
                          setFileToDelete({ name: file.name, isTemp: file.isTemp })
                          setIsDeleteDialogOpen(true)
                        }}
                        title={`Delete file ${filesQuery.data.findIndex((f) => f.name === file.name) + 1} of ${
                          filesQuery.data.length
                        }`}
                      >
                        {'X'}
                      </RedButton>
                    </li>
                  ))
              }
            </ul>

            {filesQuery.data.some((file) => file.isTemp) && (
              <>
                <h4>Temporary Files</h4>
                <ul className='flex max-h-48 max-w-96 flex-col flex-wrap overflow-x-auto rounded-xl border-2 border-white p-[.2rem] md:max-h-60 lg:max-h-72'>
                  {filesQuery.isError ?
                    <div className='alert alert-error'>An error occurred while fetching files.</div>
                  : filesQuery.data
                      .filter((file) => file.isTemp)
                      .map((file) => (
                        <li className='flex w-64 flex-row p-1 text-[.2rem]' key={file.name}>
                          <FileButton file={file.name} size={file.size} temp />
                          <button
                            disabled={false}
                            className='btn btn-square btn-warning rounded-xl bg-red-500 hover:bg-red-400'
                            onClick={() => {
                              setFileToDelete({ name: file.name, isTemp: file.isTemp })
                              setIsDeleteDialogOpen(true)
                            }}
                            title='Delete File'
                          >
                            {'X'}
                          </button>
                        </li>
                      ))
                  }
                </ul>
              </>
            )}
          </>
        )}
        {!filesQuery.isLoading && filesQuery.data.length === 0 && <li>{'No files found'}</li>}
      </div>
      {alert !== '' && <ErrorAlert>{alert}</ErrorAlert>}
      <Dialog
        open={isDeleteDialogOpen}
        close={() => {
          setIsDeleteDialogOpen(false)
          setFileToDelete(null)
          setIsPermanentDelete(false)
        }}
      >
        <div className='flex flex-col items-center gap-4 p-4'>
          <div className='flex flex-row items-center justify-center gap-2'>
            <h2 className='text-lg font-bold'>Delete</h2>{' '}
            <span className='rounded-md bg-slate-600 px-1 text-red-600'>{fileToDelete?.name}</span>
          </div>
          <p className='text-center'>Are you sure you want to delete this file?</p>
          <label className='label m-2 cursor-pointer rounded-xl bg-gray-600 p-2 text-black hover:bg-gray-700'>
            <span className='label-text text-balance'>Delete Permanently</span>
            <span className='w-2'></span>
            <input
              type='checkbox'
              checked={isPermanentDelete}
              onChange={(e) => setIsPermanentDelete(e.target.checked)}
              className='checkbox'
            />
          </label>
          <div className='flex gap-4'>
            <button
              onClick={() => handleDelete(isPermanentDelete)}
              className='btn btn-error rounded-xl bg-red-500 px-4 py-2 hover:bg-red-400'
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
