"use client"
import axios, { type AxiosResponse } from 'axios'
import { useState, useEffect, type ChangeEvent, use } from 'react'
import Link from 'next/link'
import React from 'react'
import Loading from '@/components/loading'


export default function FileUploader() {
  const [files, setFiles] = useState<string[]>([])
  const [passwordEntered, setPasswordEntered] = useState<boolean>(false)
  const correctPassword = process.env.NEXT_CLIENT_FILE_MANAGER_PASSKEY ?? '7693' // Don't really care if this gets leaked
  const [alert, setAlert] = useState<string>('')

  useEffect(() => {
    use(getFiles())
  }, [])

  useEffect(() => {
    if (alert == '') return
    setTimeout(() => {
      setAlert('')
    }, 2500)
  }, [alert])

  async function deleteFile(file: string) {
    if (!passwordEntered) {
      const password = (`${prompt(`Enter passkey to delete files`)}`)
      if (password === correctPassword) {
        setPasswordEntered(true)
      } else {
        setAlert('Incorrect passkey')
        return
      }
    }
    try {
      await axios.delete(`https://api.gloved.dev/delete/${file}`)
      await getFiles()
      setAlert('')
    } catch (error) {
      console.error("An error occurred while deleting file:", error)
      setAlert('An error occurred while deleting file')
    }
  }

  async function getFiles() {
    setFiles(['loading'])
    try {
      const response: AxiosResponse<string[]> = await axios.get("https://api.gloved.dev/files")
      setFiles(response.data)
      setAlert('')
    } catch (error) {
      console.error("An error occurred while getting files:", error)
      setFiles([])
      setAlert('An error occured while getting files')
    }
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      const formData = new FormData()
      formData.append("file", file)

      await axios.post("https://api.gloved.dev/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      await getFiles()
      setAlert('')
    } catch (error) {
      console.error("An error occurred while uploading file:", error)
      setAlert('An error occured while uploading file')
    }
  }

  return (
    <>
      <div className='flex flex-col items-center justify-center p-4 border-white border-4 rounded-xl bg-gray-700/50'>
        <h1 className='font-bold'>{"Simple File Uploader"}</h1>
        <p className='text-sm'>{"(Don't download random files off the internet)"}</p>
        <br />

        <label htmlFor='uploadBtn'>{"Upload File"}</label>
        <input id='uploadBtn' className='file-input file-input-bordered file-input-primary bg-black glass w-full max-w-xs' type="file" onChange={uploadFile} />

        <h2 className='text-center justify-center content-center place-items-center pt-4 pb-4'>
          {"Download Files "}
          <button className='btn btn-circle hover:animate-spin' onClick={getFiles} title="Refresh Files">↻</button>
        </h2>

        {files[0] !== 'loading' && files.length > 0 &&
          <ul className='flex flex-wrap flex-col overflow-x-auto lg:max-h-72 max-h-48 max-w-96 border-white border-2 rounded-xl p-[.2rem] '>
            {!!files.length && files[0] !== 'loading' && files.map(file => (
              <li className='flex flex-row p-1 text-[.2rem] w-64' key={file}>
                <Link className='mx-2 w-64 truncate rounded-xl' href={`https://api.gloved.dev/download/${file}`}>
                  <button className='btn mx-2 p-3 rounded-xl hover:animate-pulse hover:bg-gray-700'>{file}</button>
                </Link>
                <button
                  disabled={false}
                  className='btn btn-warning btn-square bg-red-500 rounded-xl hover:bg-red-400'
                  onClick={() => deleteFile(file)}
                  title="Delete File"
                >
                  {"X"}
                </button>
              </li>
            ))}
          </ul>}
        {files[0] === 'loading' && <Loading />}
        {files.length === 0 && <li>{"No files found"}</li>}
      </div>
      {alert !== '' &&
        <div role="alert" className="m-2 alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{alert}</span>
        </div>
      }
    </>
  )
}

