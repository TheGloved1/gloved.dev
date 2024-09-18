import AdminComponent from '@/components/AdminComponent'
import BotButtons from '@/components/BotButtons'
import Counter from '@/components/Counter'
import { Black, Calc, Discord, Github, Hangman, Home, Todos } from '@/lib/constants'
import type { MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import React from 'react'

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
        src='/logo.png'
        alt='Gloved.Dev Icon'
        className='fixed left-1 top-1 hidden h-12 w-12 rounded-xl border-2 border-white shadow-lg sm:left-4 sm:top-4 sm:block sm:h-16 sm:w-16 sm:transform md:left-4 md:top-4 md:h-24 md:w-24 lg:left-4 lg:top-4 xl:left-4 xl:top-4 2xl:left-4 2xl:top-4'
      />
      <div className='container flex flex-col items-center justify-center gap-12 px-4 py-16'>
        <h1 className='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          gloved<span className='text-[hsl(280,100%,40%)]'>.</span>dev
        </h1>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Home.link}>
            <h3 className='text-2xl font-bold'>
              {Home.title} <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{Home.description}</div>
          </Link>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Todos.link}>
            <h3 className='text-2xl font-bold'>
              {Todos.title} <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{Todos.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Hangman.link}>
            <h3 className='text-2xl font-bold'>
              {Hangman.title} <span className='inline-block transition-transform group-hover:translate-x-1'>{'->'}</span>
            </h3>
            <div className='text-lg'>{Hangman.description}</div>
          </Link>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Github.link}>
            <h3 className='text-2xl font-bold'>
              {Github.title} <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{Github.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-1 md:gap-8'>
          <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Calc.link}>
            <h3 className='text-2xl font-bold'>
              {Calc.title} <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
            </h3>
            <div className='text-lg'>{Calc.description}</div>
          </Link>
        </div>
        <AdminComponent>
          <div className='divider w-[75vw] max-w-[1000px] items-center self-center' />
          <h2 className='text-3xl font-bold'>
            <u>{'Admin Stuff'}</u>
          </h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
            <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Black.link}>
              <h3 className='text-2xl font-bold'>
                {Black.title} <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
              </h3>
              <div className='text-lg'>{Black.description}</div>
            </Link>
            <Link className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20' to={Discord.link}>
              <h3 className='text-2xl font-bold'>
                {Discord.title} <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>{'->'}</span>
              </h3>
              <div className='text-lg'>{Discord.description}</div>
            </Link>
          </div>
          <BotButtons />
          <Counter />
        </AdminComponent>
      </div>
      <div className='divider w-[75vw] max-w-[1000px] items-center self-center' />
      <div className='px-30 container flex flex-col items-center gap-1 self-center px-4 py-4'>
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
