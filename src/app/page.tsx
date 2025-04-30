'use client';
import AdminComponent from '@/components/AdminComponent';
import { PageVisits } from '@/components/PageVisits';
import ParticleText from '@/components/ParticleText';
import ThemeChanger from '@/components/ThemeChanger';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import Constants from '@/lib/constants';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Video } from 'lucide-react';
import DefaultPlayer from 'next-video/player';
import Link from 'next/link';
import React from 'react';

export default function Page(): React.JSX.Element {
  const isMobile = useIsMobile();
  return (
    <ThemeChanger>
      <div className='absolute left-0 top-0 flex items-center gap-2 rounded-br-lg border-b-2 border-r-2 border-border p-2'>
        <SignedOut>
          <SignInButton mode={'modal'}>
            <Button className='btn gap-1'>Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className='flex items-center gap-2'>
            <UserButton showName />
          </div>
        </SignedIn>
      </div>
      <div className='container flex flex-col items-center justify-center gap-8 px-1 py-16 md:px-4'>
        {/* Old Heading */}
        {isMobile && (
          <h1 className='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'>
            gloved<span className='text-[hsl(280,100%,40%)]'>.</span>dev
          </h1>
        )}

        {/* New Heading */}
        {!isMobile && (
          <ParticleText text='gloved.dev' size={100} hoverColor='#4B0082' particleCount={8000} edgeComplexity={5} />
        )}

        <div className='flex max-w-[1000px] flex-shrink-0 flex-grow flex-wrap justify-center gap-4'>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          </div>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          </div>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
              href={Constants.Cookies.link}
              prefetch
            >
              <h3 className='text-2xl font-bold'>
                {Constants.Cookies.title}{' '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {'->'}
                </span>
              </h3>
              <div className='text-lg'>{Constants.Cookies.description}</div>
            </Link>
          </div>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          </div>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          </div>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
              href={Constants.Shortener.link}
              prefetch
            >
              <h3 className='text-2xl font-bold'>
                {Constants.Shortener.title}{' '}
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {'->'}
                </span>
              </h3>
              <div className='text-lg'>{Constants.Shortener.description}</div>
            </Link>
          </div>
          <div className='flex-shrink-0 flex-grow basis-[300px]'>
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className='btn gap-1'>
              <Video className='inline-block' /> Project History
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[75vh]'>
            <DialogHeader>
              <DialogTitle>Project History</DialogTitle>
              <DialogDescription>
                {
                  'The project is displayed as a tree where the root is the centre, folders are branches and files are leaves.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className='flex w-full items-center justify-center self-center'>
              <Link href={'/gource.webm'}>
                <Button>View Raw</Button>
              </Link>
            </div>
            <DefaultPlayer autoPlay loop src={'/gource.webm'} className='max-h-[75vh] rounded-xl' />
          </DialogContent>
        </Dialog>

        <AdminComponent>
          <div className='divider mx-auto w-[75vw] max-w-[1000px] items-center self-center' />
          <h2 className='text-3xl font-bold'>
            <u>{'Admin Stuff'}</u>
          </h2>
          <div className='flex max-w-[1000px] flex-shrink-0 flex-grow flex-wrap justify-center gap-4'>
            <div className='flex-shrink-0 flex-grow basis-[300px]'>
              <Link
                className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
                href={'/admin'}
                prefetch
              >
                <h3 className='text-2xl font-bold'>
                  {'Admin Panel'}{' '}
                  <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                    {'->'}
                  </span>
                </h3>
                <div className='text-lg'>{'Admin page for admin stuff'}</div>
              </Link>
            </div>
            <div className='flex-shrink-0 flex-grow basis-[300px]'>
              <Link
                className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
            </div>
            <div className='flex-shrink-0 flex-grow basis-[300px]'>
              <Link
                className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
                href={Constants.White.link}
                prefetch
              >
                <h3 className='text-2xl font-bold'>
                  {Constants.White.title}{' '}
                  <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                    {'->'}
                  </span>
                </h3>
                <div className='text-lg'>{Constants.White.description}</div>
              </Link>
            </div>
            <div className='flex-shrink-0 flex-grow basis-[300px]'>
              <Link
                className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20'
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
          </div>
        </AdminComponent>
      </div>
      <div className='divider mx-auto w-[75vw] max-w-[1000px] items-center self-center' />
      <div className='px-30 container flex flex-col items-center gap-1 self-center px-4 py-4 text-xs md:text-sm lg:text-base'>
        <p className='p-4 text-sm'>
          {'Help me improve the site and '}
          <Link className='btn btn-outline text-sm' href={'https://crotus.io/gloves/review'}>
            {'Write a review!'}
          </Link>
        </p>
      </div>
      <PageVisits />
    </ThemeChanger>
  );
}
