/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Image from "next/image"
import { useState } from "react"

type GitUserProps = {
  name: string
  html_url: string
  avatar_url: string
  login: string
  bio: string
  company: string
  location: string
  blog: string
  email: string
}

export default async function GitUser({ name }: GitUserProps) {
  const [gitUser, setGitUser] = useState<GitUserProps | null>(null)
  const response = await fetch(`https://api.github.com/users/${name}`)
  const data: GitUserProps = await response.json()
  setGitUser(data)

  return (
    <div className="container ring ring-white">
      {gitUser && (
        <div className="image-container git-image-container">
          <a href={gitUser.html_url} target="_blank" rel="noopener">
            <Image src={gitUser.avatar_url} alt="User image" />
          </a>
        </div>
      )}
      {gitUser && (
        <>
          <h2>{gitUser.name}</h2>
          <span>{gitUser.login}</span>
          <p>{gitUser.bio}</p>
          <a className="fancy-link" href={gitUser.html_url} target="_blank" rel="noopener">
            {gitUser.html_url}
          </a>
        </>
      )}
    </div>
  )
}
