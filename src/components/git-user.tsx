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
    const data = await response.json() as UserData
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
      <div className="container flex flex-col gap-4 justify-center items-center p-4 border-4 border-white border-dashed rounded-lx">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  } else if (data.message) {
    return (
      <div className="container flex flex-col gap-4 justify-center items-center p-4 rounded-lx">
        <div role="alert" className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error! Failed to fetch data.</span>
        </div>
      </div>
    )
  } else {
    return (
      <div className="container flex flex-col gap-4 justify-center items-center p-4 rounded-3xl border-4 border-white border-dashed bg-gray-600/50">
        <div>
          <Link href={data.html_url} target="_blank" rel="noopener">
            <Image className="rounded-full" width={200} height={200} src={data.avatar_url} alt="User image" loading='lazy' />
          </Link>
        </div>
        <div className='flex flex-col gap-1'>
          <strong>{data.login}</strong>
          <span>{data.name}</span>
        </div>
        <p className='flex flex-col p-1 bg-gray-600 rounded-xl'>{data.bio}</p>
        <Link className="fancy-link" href={data.html_url} target="_blank" rel="noopener">
          {data.html_url}
        </Link>
      </div>
    )
  }
}

