/** @format */

import AdminComponent from '@/components/admin-component'
import Link from 'next/link'
import React from 'react'

export default function Page(): React.JSX.Element {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-950 to-[#1e210c] text-white'>
      <div className='container flex flex-col items-center justify-center gap-12 px-4 py-16'>
        <h1 className='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          gloved<span className='text-[hsl(280,100%,40%)]'>.</span>dev
        </h1>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href='/home'>
            <h3 className='text-2xl font-bold'>
              Home <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
            </h3>
            <div className='text-lg'>{'The home page for my About Me based web project built with the Next.js React Web Framework.'}</div>
          </Link>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href='/todos'>
            <h3 className='text-2xl font-bold'>
              Todo App <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
            </h3>
            <div className='text-lg'>{'A simple todo list web app. Uses local storage to save and get todos list even after reloading.'}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href='/hangman'>
            <h3 className='text-2xl font-bold'>
              Janky Hangman <span className='inline-block transition-transform group-hover:translate-x-1'>-&gt;</span>
            </h3>
            <div className='text-lg'>{'A simple hangman game web app. Guess the word. (Might be broken)'}</div>
          </Link>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href='https://github.com/TheGloved1/'>
            <h3 className='text-2xl font-bold'>
              Github <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
            </h3>
            <div className='text-lg'>{'View the source code. Visit my Github profile to take a look at my other projects.'}</div>
          </Link>
        </div>
        <AdminComponent>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
            <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href={'/black'}>
              <h3 className='text-2xl font-bold'>
                Black Screen <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
              </h3>
              <div className='text-lg'>{'This is just a black screen'}</div>
            </Link>
            <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href={'/discord'}>
              <h3 className='text-2xl font-bold'>
                Discord <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
              </h3>
              <div className='text-lg'>{'Join my Discord to chat!'}</div>
            </Link>
          </div>
        </AdminComponent>
        {/* <OldSite /> */}
      </div>
      <div className='px-30 flex content-center'>
        <p className='p-4 text-sm'>Help me improve and</p>
        <Link href={'https://crotus.io/gloves/review'} className='btn btn-outline text-sm'>
          Write a review!
        </Link>
      </div>
    </main>
  )
}

function OldSite() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-8'>
      <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' href='https://old.gloved.dev/' target='_blank'>
        <h3 className='text-2xl font-bold'>
          Old Site <span className='inline-block transition-transform group-hover:translate-x-1'>-&gt;</span>
        </h3>
        <div className='text-lg'>Visit the old site. This is the previous version of my About Me site built with Vue.</div>
      </Link>
    </div>
  )
}
