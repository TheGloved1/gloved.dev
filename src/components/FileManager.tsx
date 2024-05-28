"use client"
import axios, { type AxiosResponse } from 'axios'
import { useState, useEffect, type ChangeEvent } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'


export default function FileManager() {
  const [files, setFiles] = useState<string[]>([])
  const [passwordEntered, setPasswordEntered] = useState<boolean>(false)
  const correctPassword = process.env.NEXT_CLIENT_FILE_MANAGER_PASSKEY
  const [alert, setAlert] = useState<string>('')

  useEffect(() => {
    const GETFILES = async () => {
      await getFiles()
    }
    void GETFILES()
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
      if (password === "7693" ?? correctPassword) {
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
    setFiles([])
    try {
      const response: AxiosResponse<string[]> = await axios.get("https://api.gloved.dev/files")
      setFiles(response.data)
      console.log(response.data)
      setAlert('')
    } catch (error) {
      console.error("An error occurred while getting files:", error)
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
      <div className='flex flex-col p-4 border-white border-4 rounded-xl'>
        <h1 className='font-bold'>{"Simple File Uploader"}</h1>
        <p className='text-sm'>{"(Don't download random files off the internet)"}</p>
        <br />

        <Label htmlFor='uploadBtn'>{"Upload File"}</Label>
        <Input id='uploadBtn' className='bg-black cursor-pointer hover:animate-pulse' type="file" onChange={uploadFile} />

        <h2 className='text-center justify-center content-center place-items-center pt-4 pb-4'>
          {"Download Files "}
          <Button className='rounded-xl' onClick={getFiles} title="Refresh Files">↻</Button>
        </h2>
        <ul className='flex flex-wrap flex-col overflow-x-auto lg:max-h-72 max-h-48 max-w-96 border-white border-2 rounded-xl p-[.2rem] '>
          {files.map(file => (
            <li className='flex flex-row p-1 text-[.2rem] w-64' key={file}>
              <a className='mx-2 w-64 truncate rounded-xl' href={`https://api.gloved.dev/download/${file}`}><Button className='mx-2 p-3 rounded-xl hover:animate-pulse hover:bg-gray-700'>{file}</Button></a>
              <Button disabled={true} className='bg-red-500 rounded-xl hover:bg-red-400' onClick={() => deleteFile(file)} title="Delete File (WIP)">{"X"}</Button>
            </li>
          ))}
        </ul>
      </div>
      <p className='text-red-500'>{alert}</p>
    </>
  )
}
