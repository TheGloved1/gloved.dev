"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface UserData {
  html_url: string
  avatar_url: string
  name: string
  login: string
  bio: string
}

type GitUserProps = {
  name: string
}

export default function GitUser({ name }: GitUserProps) {
  const [data, setData] = useState<UserData | null>(null)
  console.log('Rendering GitUser...')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${name}`).then((res) => res.json()) as UserData
        setData(response)
      } catch (error) {
        console.error('Error:', error)
      }
    }

    void fetchData()
  }, [name])

  if (!data) {
    return (
      <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
        <p>Loading Data...</p>
      </div>
    )
  }

  return (
    <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
      {data && (
        <>
          <div>
            <Link href={data.html_url} target="_blank" rel="noopener">
              <Image className="rounded-xl" width={200} height={200} src={data.avatar_url} alt="User image" />
            </Link>
          </div>
          <h2>{data.name}</h2>
          <span>{data.login}</span>
          <p>{data.bio}</p>
          <Link className="fancy-link" href={data.html_url} target="_blank" rel="noopener">
            {data.html_url}
          </Link>
        </>
      )}
    </div>
  )
}

