"use client"
import Image from 'next/image'
import { useMutation } from 'react-query'
import { getUser } from 'src/server/actions'
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
  const [user, setUser] = useState<UserData | null>(null)

  const { mutate: server_getUser } = useMutation({
    mutationFn: getUser,
    onSuccess: (data) => setUser(data),
  })

  useEffect(() => {
    server_getUser({ userId: name })
  }, [name, server_getUser])

  if (!user) {
    return null
  }
  return (
    <div className="container flex flex-col gap-4 rounded border-white items-center justify-center">
      <>
        <div className="image-container git-image-container">
          <a href={user.html_url} target="_blank" rel="noopener">
            <Image width={200} height={200} src={user.avatar_url} alt="User image" />
          </a>
        </div>
        <h2>{user.name}</h2>
        <span>{user.login}</span>
        <p>{user.bio}</p>
        <a className="fancy-link" href={user.html_url} target="_blank" rel="noopener">
          {user.html_url}
        </a>
      </>
    </div>
  )
}

