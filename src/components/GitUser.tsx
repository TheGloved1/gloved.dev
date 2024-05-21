"use client"
import { githubUser } from '@/server/actions'
import Image from 'next/image'
import Link from 'next/link'
import React, {
  // useEffect,
  // useState
} from 'react'
import { useQuery } from 'react-query'

// interface UserData {
//   html_url: string
//   avatar_url: string
//   name: string
//   login: string
//   bio: string
// }

type GitUserProps = {
  name: string
}

export default function GitUser({ name }: GitUserProps) {
  const data = useQuery({
    queryKey: ['user'],
    queryFn: () => fetch(`https://api.github.com/users/${name}`).then((res) => res.json()),
  })

  if (data.isLoading) {
    return (
      <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
        <p>Loading Data...</p>
      </div>
    )
  }
  if (data.isError) {
    return (
      <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
        <p>Error fetching data...</p>
      </div>
    )
  }

  return (
    <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
      {data && (
        <>
          <div>
            <Link href={data.data.html_url} target="_blank" rel="noopener">
              <Image className="rounded-xl" width={200} height={200} src={data.data.avatar_url} alt="User image" />
            </Link>
          </div>
          <h2>{data.data.name}</h2>
          <span>{data.data.login}</span>
          <p>{data.data.bio}</p>
          <Link className="fancy-link" href={data.data.html_url} target="_blank" rel="noopener">
            {data.data.html_url}
          </Link>
        </>
      )}
    </div>
  )
}

