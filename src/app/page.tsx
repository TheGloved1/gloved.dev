import Leo from '@/../public/Leo.png';
import AdminComponent from '@/components/AdminComponent';
import Counter from '@/components/Counter';
import { PageVisits } from '@/components/PageVisits';
import TopScrollVisibility from '@/components/TopScrollVisibility';
import Constants from '@/lib/constants';
import { Link } from 'next-view-transitions';
import Image from 'next/image';
import React from 'react';

export default function Page(): React.JSX.Element {
  return (
    <>
      <Link
        href={'/gallery'}
        className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2'
        prefetch
      >
        <Image
          src={Leo}
          alt=''
          placeholder='blur'
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
            href={Constants.Home.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Home.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Home.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.Chat.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Chat.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Chat.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.FileUploader.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.FileUploader.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.FileUploader.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.Colors.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Colors.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Colors.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.Todos.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Todos.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Todos.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.Hangman.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Hangman.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Hangman.description}</div>
          </Link>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8'>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.Calc.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Calc.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Calc.description}</div>
          </Link>
          <Link
            className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
            href={Constants.Github.link}
            prefetch
          >
            <h3 className='text-2xl font-bold'>
              {Constants.Github.title}{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                {'->'}
              </span>
            </h3>
            <div className='text-lg'>{Constants.Github.description}</div>
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
              href={Constants.Black.link}
              prefetch
            >
              <h3 className='text-2xl font-bold'>
                {Constants.Black.title}{' '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {'->'}
                </span>
              </h3>
              <div className='text-lg'>{Constants.Black.description}</div>
            </Link>
            <Link
              className='group flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
              href={Constants.Discord.link}
              prefetch
            >
              <h3 className='text-2xl font-bold'>
                {Constants.Discord.title}{' '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {'->'}
                </span>
              </h3>
              <div className='text-lg'>{Constants.Discord.description}</div>
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
  );
}
