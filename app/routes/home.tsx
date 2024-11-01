import ChevronLeft from '@/components/ChevronLeft'
import FileUploader from '@/components/FileUploader'
import GitUser from '@/components/GitUser'
import ObserverSection from '@/components/ObserverSection'
import ScrollLink from '@/components/ScrollLink'
import { Link, MetaFunction } from '@remix-run/react'
import React from 'react'
import { WIPHeader } from './home/WIPHeader'

export const meta: MetaFunction = () => {
  return [
    { title: 'gloved.dev | Home' },
    {
      name: 'description',
      content: 'The home page for my About Me based web project built with the Next.js React Web Framework',
    },
    { name: 'icons', content: 'https://avatars.githubusercontent.com/u/96776176?v=4' },
  ]
}

const sections = ['Welcome', 'About', 'Robotics', 'Github', 'File Uploader']

export default function Page(): React.JSX.Element {
  console.log('Rendering Home...')
  return (
    <>
      <div className='fixed left-0 right-0 top-0 z-[1000]'>
        <div className='navbar bg-zinc-800'>
          <div className='navbar-start'>
            <Link to={'/'} className='btn btn-ghost text-xl'>
              <ChevronLeft />
              Back
            </Link>
          </div>
          <div className='navbar-end flex md:hidden'>
            <div className='dropdown'>
              <div role='button' className='btn btn-ghost md:hidden'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h8m-8 6h16' />
                </svg>
              </div>
              <ul className='menu dropdown-content menu-sm z-[1] mt-3 w-44 -translate-x-32 rounded-box bg-zinc-800 p-2 shadow'>
                {sections.map((section) => (
                  <li key={section}>
                    <ScrollLink to={`#${section}`}>{section}</ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='navbar-center hidden md:flex'>
            <div className='dropdown'>
              <div role='button' className='btn btn-ghost md:hidden'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h8m-8 6h16' />
                </svg>
              </div>
              <ul className='menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-zinc-800 p-2 shadow'>
                {sections.map((section) => (
                  <li key={section}>
                    <ScrollLink to={`#${section}`}>{section}</ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
            <ul className='menu menu-horizontal px-1'>
              {sections.map((section) => (
                <li key={section}>
                  <ScrollLink to={`#${section}`} className='mx-1'>
                    {section}
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </div>
          <div className='navbar-end hidden lg:flex'>
            <h1 className='p-2 text-lg font-extrabold tracking-tight text-white'>
              gloved<span className='text-[hsl(280,93%,72%)]'>.</span>dev
            </h1>
          </div>
        </div>
      </div>
      <main className='flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] font-jetbrains text-white'>
        <WIPHeader />
        <div className='flex flex-col items-center justify-center gap-12 px-4 py-16'>
          <ObserverSection id={sections[0]}>
            <p className='text-xl font-extrabold'>{'Welcome to my website!'}</p>
            <p className='p-3 text-xl'></p>
            <p>{"I'm Kaden Hood."}</p>
            <p>{'a self taught software engineer.'}</p>
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <ObserverSection id={sections[1]}>
            <p className='font-extrabold'>{'About Me'}</p>
            <p className='p-3 text-xl'></p>
            <p>{'I wear gloves, and go by Gloves online.'}</p>
            <p>{"And if you couldn't tell already, I like to code."}</p>
            <p className='p-3 text-xl'></p>
            <p>{'I started programming in my 2nd year of high school.'}</p>
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <ObserverSection id={sections[2]}>
            <p>
              <strong>
                <Link className='fancy-link' to='https://meporobotics.com/'>
                  {'Mediapolis Robotics Club'}
                </Link>
              </strong>
            </p>
            <p>
              <Link className='fancy-link' to='https://frc-events.firstinspires.org/team/9061'>
                {'FIRST Inspires Robotics Team 9061'}
              </Link>
            </p>
            <p>{'Since 2023 - Present'}</p>
            <p className='p-3 text-xl'></p>
            <p>
              <strong>{'Roles: '}</strong>
              {'Programmer & Mentor'}
            </p>
            <p>
              <strong>{'Language: '}</strong>
              {'Java'}
            </p>
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <ObserverSection id={sections[3]}>
            <p className='font-extrabold'>{'My Github Profile'}</p>
            <p className='p-3 text-xl'></p>
            <GitUser name='TheGloved1' />
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <ObserverSection id={sections[4]}>
            <FileUploader />
            <Link to={'/file-uploader'} className='group btn m-4 text-xl'>
              Standalone Version{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                -&gt;
              </span>
            </Link>
          </ObserverSection>
        </div>
      </main>
    </>
  )
}
