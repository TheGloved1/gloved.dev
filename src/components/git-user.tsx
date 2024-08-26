import Image from 'next/image'
import Link from 'next/link'
import React, { use } from 'react'

type UserData = {
  html_url: string
  avatar_url: string
  name: string
  login: string
  bio: string
  message?: string
}

const fetchData = async (name: string) => {
  try {
    const response = await fetch(`https://api.github.com/users/${name}`, {
      cache: 'force-cache',
    })
    const data = (await response.json()) as UserData
    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export default function GitUser(props: { name: string }) {
  const data = use(fetchData(props.name))
  if (!data) {
    return (
      <div className="rounded-lx container flex flex-col items-center justify-center gap-4 border-4 border-dashed border-white p-4">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  } else if (data.message) {
    return (
      <div className="rounded-lx container flex flex-col items-center justify-center gap-4 p-4">
        <div role="alert" className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error! Failed to fetch data.</span>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed border-white bg-gray-600/50 p-4">
        <div>
          <Link href={data.html_url} target="_blank" rel="noopener">
            <Image className="rounded-full" width={200} height={200} src={data.avatar_url} alt="User image" loading="lazy" />
          </Link>
        </div>
        <div className="flex flex-col gap-1">
          <strong>{data.login}</strong>
          <span>{data.name}</span>
        </div>
        <p className="flex flex-col rounded-xl bg-gray-600 p-1">{data.bio}</p>
        <Link className="fancy-link" href={data.html_url} target="_blank" rel="noopener">
          {data.html_url}
        </Link>
      </div>
    )
  }
}
