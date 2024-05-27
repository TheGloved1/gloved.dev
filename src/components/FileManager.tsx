"use client"
import axios, { type AxiosResponse } from 'axios';
import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';


export default function FileManager() {
  const [files, setFiles] = useState<string[]>([]);
  const [passwordEntered, setPasswordEntered] = useState<boolean>(false);
  const correctPassword = process.env.NEXT_CLIENT_FILE_MANAGER_PASSKEY;

  useEffect(() => {
    const GETFILES = async () => {
      await getFiles();
    }
    void GETFILES();
  }, []);

  async function deleteFile(file: string) {
    if (!passwordEntered) {
      const password = prompt(`Enter passkey to delete files`) ?? '';
      if (password === correctPassword) {
        setPasswordEntered(true);
      } else {
        alert('Incorrect passkey');
        return;
      }
    }
    try {
      await axios.delete(`https://api.gloved.dev/delete/${file}`);
      await getFiles();
    } catch (error) {
      console.error("An error occurred while deleting file:", error);
      alert('An error occurred while deleting file');
    }
  }

  async function getFiles() {
    setFiles([]);
    try {
      const response: AxiosResponse<string[]> = await axios.get("https://api.gloved.dev/files");
      setFiles(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("An error occurred while getting files:", error);
      alert('An error occured while getting files');
    }
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      await axios.post("https://api.gloved.dev/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await getFiles();
    } catch (error) {
      console.error("An error occurred while uploading file:", error);
      alert('An error occured while uploading file');
    }
  }

  return (
    <div className='flex flex-col ring-2 p-4'>
      <h1 className='font-bold'>{"Simple File Uploader"}</h1>
      <p className='text-sm'>{"(Don't download random files off the internet)"}</p>
      <br />

      <Label htmlFor='uploadBtn'>{"Upload File"}</Label>
      <Input id='uploadBtn' className='bg-black' type="file" onChange={uploadFile} />

      <h2 className='pt-4 pb-4'>
        {"Download Files "}
        <Button onClick={getFiles} title="Refresh Files">&#8635;</Button>
      </h2>
      <ul className='ring-1 p-[.2rem]'>
        {files.map(file => (
          <li className='p-2 text-[.2rem]' key={file}>
            <a href={`https://api.gloved.dev/download/${file}`}><Button className='mx-2 p-3 rounded-xl hover:animate-pulse'>{file}</Button></a>
            <Button className='bg-red-500' onClick={() => deleteFile(file)} title="Delete File">{"X"}</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
