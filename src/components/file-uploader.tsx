'use client'
import axios, { type AxiosResponse } from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Loading from '@/components/loading'

export default function FileUploader(): React.JSX.Element {
  const correctPassword = process.env.NEXT_CLIENT_FILE_MANAGER_PASSKEY ?? '7693'
  const [files, setFiles] = useState<string[]>([])
  const [alert, setAlert] = useState<string>('')
  const [passwordEntered, setPasswordEntered] = useState<boolean>(window.localStorage.getItem('fileUploaderPasswordEntered') === correctPassword)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    getFiles()
  }, [])

  useEffect(() => {
    if (alert === '') return
    const timer = setTimeout(() => {
      setAlert('')
    }, 2500)
    return () => clearTimeout(timer)
  }, [alert])

  async function deleteFile(file: string): Promise<void> {
    if (!passwordEntered) {
      const password = prompt(`Enter passkey to delete files`)
      if (!password) {
        return
      }
      if (password === correctPassword) {
        window.localStorage.setItem('fileUploaderPasswordEntered', correctPassword)
        setPasswordEntered(true)
      } else {
        setAlert('Incorrect passkey')
        return
      }
    }
    try {
      setLoading(true)
      await axios.delete(`https://api.gloved.dev/delete/${file}`)
      setAlert('')
      getFiles()
    } catch (error) {
      console.error('An error occurred while deleting file:', error)
      setAlert('An error occurred while deleting file')
    } finally {
      setLoading(false)
    }
  }

  async function getFiles(): Promise<void> {
    setLoading(true)
    setFiles(['loading'])
    try {
      const response: AxiosResponse<string[]> = await axios.get('https://api.gloved.dev/files')
      setFiles(response.data)
      setAlert('')
    } catch (error) {
      console.error('An error occurred while getting files:', error)
      setFiles([])
      setAlert('An error occurred while getting files')
    } finally {
      setLoading(false)
    }
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append('file', file)

      await axios.post('https://api.gloved.dev/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      getFiles()
      setAlert('')
    } catch (error) {
      console.error('An error occurred while uploading file:', error)
      setAlert('An error occurred while uploading file')
    }
  }

  return (
    <>
      <div className='flex flex-col items-center justify-center rounded-xl border-4 border-white bg-gray-700/50 p-4 text-[10px] md:text-[1rem]'>
        <h1 className='font-bold'>{'Simple File Uploader'}</h1>
        <p className='text-[0.5rem] md:text-sm'>{"(Don't download random files off the internet)"}</p>
        <br />

        <label htmlFor='uploadBtn'>{'Upload File'}</label>
        <input id='uploadBtn' className='glass file-input file-input-primary max-w-80 rounded-xl bg-black hover:animate-pulse' type='file' onChange={uploadFile} />

        <h2 className='place-items-center content-center justify-center pb-4 pt-4 text-center'>
          {'Download Files '}
          <button className='btn btn-circle btn-sm hover:animate-spin' onClick={getFiles} title='Refresh Files'>
            ↻
          </button>
        </h2>

        {loading && <Loading />}
        {!loading && files.length > 0 && (
          <ul className='flex max-h-48 max-w-96 flex-col flex-wrap overflow-x-auto rounded-xl border-2 border-white p-[.2rem] lg:max-h-72'>
            {files.map((file) => (
              <li className='flex w-64 flex-row p-1 text-[.2rem]' key={file}>
                <Link className='mx-2 w-64 truncate rounded-xl' href={`https://api.gloved.dev/download/${file}`}>
                  <button className='btn mx-2 rounded-xl p-3 hover:animate-pulse hover:bg-gray-700'>{file}</button>
                </Link>
                <button
                  disabled={false}
                  className='btn btn-square btn-warning rounded-xl bg-red-500 hover:bg-red-400'
                  onClick={() => deleteFile(file)}
                  title='Delete File'
                >
                  {'X'}
                </button>
              </li>
            ))}
          </ul>
        )}
        {!loading && files.length === 0 && <li>{'No files found'}</li>}
      </div>
      {alert !== '' && (
        <div role='alert' className='alert alert-error m-2'>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6 shrink-0 stroke-current' fill='none' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
          <span>{alert}</span>
        </div>
      )}
    </>
  )
}
