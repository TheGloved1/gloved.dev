"use client"
import axios, { type AxiosResponse } from 'axios';
import { useState, useEffect, type ChangeEvent } from 'react';
import { Button } from './ui/button';

interface FileResponse {
  data: string[];
}

export default function FileManager() {
  const [files, setFiles] = useState<string[]>([]);
  const [passwordEntered, setPasswordEntered] = useState<boolean>(false);
  const correctPassword: string = process.env.FILE_MANAGER_PASSKEY || '';

  useEffect(() => {
    const GETFILES = async () => {
      await getFiles();
    }
    void GETFILES();
  });

  async function deleteFile(file: string) {
    if (!passwordEntered) {
      const password = prompt(`Enter passkey to delete files`) || '';
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
      const response: AxiosResponse<FileResponse> = await axios.get("https://api.gloved.dev/files/");
      setFiles(response.data.data);
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
    <div>
      <h1>Simple File Uploader</h1>
      <p>(Don't download random files off the internet)</p>
      <br />

      <h2>Upload File</h2>
      <input type="file" onChange={uploadFile} />

      <h2>Download Files <button onClick={getFiles}
        title="Refresh Files">&#8635;</button>
      </h2>
      <ul>
        {files.map(file => (
          <li key={file}>
            <a href={`https://api.gloved.dev/download/${file}`}>{file}</a>
            <Button onClick={() => deleteFile(file)} title="Delete File">X</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
