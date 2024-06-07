import Image from 'next/image'
import Link from 'next/link'

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
    const response = await fetch(`https://api.github.com/users/${name}`)
    const data = await response.json() as UserData
    return data
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export default async function GitUser(props: { name: string }) {
  const data = await fetchData(props.name)
  if (!data) {
    console.log('Loading GitUser...')
    return (
      <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  } else if (data.message) {
    return (
      console.log('Error fetching data:', data.message),
      <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-lx border-white justify-center items-center">
        <div role="alert" className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Error! Failed to fetch data.</span>
        </div>
      </div>
    )
  } else {
    return (
      console.log('Rendered GitUser...'),
      <div className="container flex flex-col p-4 border-4 gap-4 border-dashed rounded-3xl border-white justify-center items-center bg-gray-600/50">
        <div>
          <Link href={data.html_url} target="_blank" rel="noopener">
            <Image className="rounded-full" width={200} height={200} src={data.avatar_url} alt="User image" />
          </Link>
        </div>
        <div className='flex flex-col gap-1'>
          <strong>{data.login}</strong>
          <span>{data.name}</span>
        </div>
        <p className='flex flex-col bg-gray-600 rounded-xl p-1'>{data.bio}</p>
        <Link className="fancy-link" href={data.html_url} target="_blank" rel="noopener">
          {data.html_url}
        </Link>
      </div>
    )
  }
}

