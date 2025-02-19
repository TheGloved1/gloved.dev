import AdminComponent from '@/components/AdminComponent'
import Counter from '@/components/Counter'
import { PageVisits } from '@/components/PageVisits'
import TopScrollVisibility from '@/components/TopScrollVisibility'
import * as constants from '@/lib/constants'
import { Metadata } from 'next'
import { Link } from 'next-view-transitions'
import Image from 'next/image'
import React from 'react'

export const metadata: Metadata = {
  title: constants.NAME,
  description:
    'Made by Kaden Hood. A personal website for my projects and interests. Built using Next.js React Web Framework.',
}

export default function Page(): React.JSX.Element {
  return (
    <>
      <Link
        href={'/gallery'}
        className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2'
        prefetch
      >
        <Image
          src='/Leo.png'
          alt=''
          width={100}
          height={100}
          className='fixed left-1 top-1 hidden h-12 w-12 rounded-xl border-2 border-white shadow-lg sm:left-4 sm:top-4 sm:block sm:h-16 sm:w-16 sm:transform md:left-4 md:top-4 md:h-24 md:w-24 lg:left-4 lg:top-4 xl:left-4 xl:top-4 2xl:left-4 2xl:top-4'
        />
      </Link>
      <TopScrollVisibility offset={100}>
        <Link
          href={'/gallery'}
          className='fixed left-2 top-2 flex items-center justify-center self-center pl-0 sm:hidden lg:hidden'
          prefetch
        >
          <button className='rounded bg-blue-500 px-4 py-2 text-white'>Go to Gallery</button>
        </Link>
      </TopScrollVisibility>
      <div className='container flex flex-col items-center justify-center gap-8 px-1 py-16 md:px-4'>
        <h1 className='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
          gloved<span className='text-[hsl(280,100%,40%)]'>.</span>dev
        </h1>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.Home.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.Home.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.Home.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.FileUploader.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.FileUploader.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.FileUploader.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.Todos.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.Todos.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.Todos.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.Hangman.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.Hangman.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.Hangman.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.Calc.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.Calc.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.Calc.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.ChatBot.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.ChatBot.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.ChatBot.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={'/colors'}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {'Stupid Color Game'}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{'Play the stupid game...'}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={constants.Github.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {constants.Github.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{constants.Github.description}</div>
          </Link>
        </div>
        <AdminComponent>
          <div className='divider w-[75vw] max-w-[1000px] items-center self-center' />
          <h2 className='text-3xl font-bold'>
            <u>{'Admin Stuff'}</u>
          </h2>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
            <Link
              className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
              href={constants.Black.link}
              prefetch
            >
              <h3 className='text-2xl font-bold'>
                {constants.Black.title}{' '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {'->'}
                </span>
              </h3>
              <div className='text-lg'>{constants.Black.description}</div>
            </Link>
            <Link
              className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
              href={constants.Discord.link}
              prefetch
            >
              <h3 className='text-2xl font-bold'>
                {constants.Discord.title}{' '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {'->'}
                </span>
              </h3>
              <div className='text-lg'>{constants.Discord.description}</div>
            </Link>
          </div>
          <Counter />
        </AdminComponent>
      </div>
      <div className='divider w-[75vw] max-w-[1000px] items-center self-center' />
      <div className='px-30 container flex flex-col items-center gap-1 self-center px-4 py-4 text-xs md:text-sm lg:text-base'>
        <p className='p-4 text-sm'>
          {'Help me improve the site and '}
          <Link className='btn btn-outline text-sm' href={'https://crotus.io/gloves/review'}>
            {'Write a review!'}
          </Link>
        </p>
      </div>
      <PageVisits />
    </>
  )
}
