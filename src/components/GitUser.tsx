'use client';
import Loading from '@/components/loading';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type UserData = {
  html_url: string;
  avatar_url: string;
  name: string;
  login: string;
  bio: string;
  message?: string;
} | null;

const fetchData = async (name: string): Promise<UserData> => {
  try {
    const response = await fetch(`https://api.github.com/users/${name}`, {
      cache: 'force-cache',
    });
    const data = (await response.json()) as UserData;
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { message: 'Failed to fetch data.' } as UserData;
  }
};

export default function GitUser({ name }: { name: string }): React.JSX.Element | undefined {
  const userQuery = useQuery({
    queryKey: ['userData', name],
    queryFn: () => fetchData(name),
  });

  if (userQuery.isLoading) {
    return (
      <div className='rounded-lx container flex flex-col items-center justify-center gap-4 border-4 border-dashed border-white p-4'>
        <Loading />
      </div>
    );
  }

  if (userQuery.isError || (userQuery.data && userQuery.data.message)) {
    return (
      <div className='rounded-lx container flex flex-col items-center justify-center gap-4 p-4'>
        <div role='alert' className='alert alert-error'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 shrink-0 stroke-current'
            fill='none'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <span>Error! Failed to fetch data.</span>
        </div>
      </div>
    );
  } else if (userQuery.data) {
    return (
      <div className='container flex flex-col items-center justify-center gap-4 rounded-3xl border-4 border-dashed border-white bg-gray-600/50 p-4'>
        <div>
          <Link href={userQuery.data.html_url} target='_blank' rel='noopener noreferrer'>
            <Image className='rounded-full' width={200} height={200} src={userQuery.data.avatar_url} alt='' loading='lazy' />
          </Link>
        </div>
        <div className='flex flex-col gap-1'>
          <strong>{userQuery.data.login}</strong>
          <span>{userQuery.data.name}</span>
        </div>
        <p className='flex flex-col rounded-xl bg-gray-600 p-1'>{userQuery.data.bio}</p>
        <Link className='fancy-link' href={userQuery.data.html_url} target='_blank' rel='noopener noreferrer'>
          {userQuery.data.html_url}
        </Link>
      </div>
    );
  }
}
