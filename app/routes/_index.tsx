import AdminComponent from '@/components/admin-component'
import BotButtons from '@/components/bot-buttons'
import type { LinksFunction, MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import React from 'react'

export const links: LinksFunction = () => {
  return [
    {
      rel: 'icon',
      href: 'https://icongeneratorai.com/api/images/a71ceb15-0f19-41b0-b5b9-3a32e5dc649f.jpg',
      type: 'image/png',
    },
  ]
}

export const meta: MetaFunction = () => {
  return [
    { title: 'gloved.dev' },
    { name: 'description', content: 'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.' },
  ]
}

export default function Page(): React.JSX.Element {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-950 to-[#1e210c] text-white'>
      <img
        src='https://icongeneratorai.com/api/images/a71ceb15-0f19-41b0-b5b9-3a32e5dc649f.jpg'
        alt='Gloved.Dev Icon'
        className='fixed left-1 top-1 hidden h-12 w-12 rounded-xl border-2 border-white shadow-lg sm:left-4 sm:top-4 sm:block sm:h-16 sm:w-16 sm:transform md:left-4 md:top-4 md:h-24 md:w-24 lg:left-4 lg:top-4 xl:left-4 xl:top-4 2xl:left-4 2xl:top-4'
      />
      <div className='container flex flex-col items-center justify-center gap-12 px-4 py-16'>
        <h1 className='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          gloved<span className='text-[hsl(280,100%,40%)]'>.</span>dev
        </h1>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'/home'}>
            <h3 className='text-2xl font-bold'>
              {'Home '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{'The home page for my About Me based web project built with the Remix Web Framework.'}</div>
          </Link>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'/todos'}>
            <h3 className='text-2xl font-bold'>
              {'Todo App '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{'A simple todo list web app. Uses local storage to save and get todos list even after reloading.'}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'/hangman'}>
            <h3 className='text-2xl font-bold'>
              {'Janky Hangman '}
              <span className='inline-block transition-transform group-hover:translate-x-1'>{'->'}</span>
            </h3>
            <div className='text-lg'>{'A simple hangman game web app. Guess the word. (Might be broken)'}</div>
          </Link>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'https://github.com/TheGloved1/'}>
            <h3 className='text-2xl font-bold'>
              {'Github '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{'View the source code. Visit my Github profile to take a look at my other projects.'}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'/calculator'}>
            <h3 className='text-2xl font-bold'>
              {'Calculator '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{'A simple calculator web app. Do math calculations.'}</div>
          </Link>
        </div>
        <AdminComponent>
          <div className='divider w-[75vw] max-w-[1000px] items-center self-center' />
          <h2 className='text-3xl font-bold'>
            <u>{'Admin Tools'}</u>
          </h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
            <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'/black'}>
              <h3 className='text-2xl font-bold'>
                {'Black Screen '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
              </h3>
              <div className='text-lg'>{'This is just a black screen'}</div>
            </Link>
            <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={'/discord'}>
              <h3 className='text-2xl font-bold'>
                {'Discord '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
              </h3>
              <div className='text-lg'>{'Join my Discord to chat!'}</div>
            </Link>
          </div>
          <BotButtons />
        </AdminComponent>
      </div>
      <div className='divider w-[75vw] max-w-[1000px] items-center self-center' />
      <div className='px-30 container flex flex-col content-center items-center justify-center gap-12 px-4 py-16'>
        <p className='p-4 text-sm'>
          {'Help me improve the site and '}
          <Link className='btn btn-outline text-sm' to={'https://crotus.io/gloves/review'}>
            {'Write a review!'}
          </Link>
        </p>
      </div>
    </main>
  )
}
