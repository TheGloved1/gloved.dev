/** @format */

import Link from 'next/link'
import React, { Suspense } from 'react'

import GitUser from '@/components/git-user'
import StyledSection from '@/components/styled-section'
import FileUploader from '@/components/file-uploader'
import ChevronLeft from '@/components/chevron-left'

import { WIPHeader } from './_components/WIPHeader'
import { type Metadata } from 'next'
import ScrollLink from '@/components/scroll-link'

export const metadata: Metadata = {
  title: 'Home',
  description: 'The home page for my About Me based web project built with the Next.js React Web Framework.',
}

const sections = ['Welcome', 'About', 'Robotics', 'Github', 'File Uploader']

export default function Page(): React.JSX.Element {
  console.log('Rendering Home...')
  const handleScroll = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    event.preventDefault()
    const element = document.getElementById(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }
  return (
    <>
      <div className='fixed left-0 right-0 top-0 z-[1000]'>
        <div className='navbar bg-base-100'>
          <div className='navbar-start'>
            <Link href={'/'} className='btn btn-ghost text-xl'>
              <ChevronLeft />
              Back
            </Link>
            <div className='dropdown'>
              <div tabIndex={0} role='button' className='btn btn-ghost md:hidden'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h8m-8 6h16' />
                </svg>
              </div>
              <ul tabIndex={0} className='menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow'>
                {sections.map((section) => (
                  <li key={section}>
                    <ScrollLink href={`#${section}`}>{section}</ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className='navbar-center hidden md:flex'>
            <ul className='menu menu-horizontal px-1'>
              {sections.map((section) => (
                <li key={section}>
                  <ScrollLink href={`#${section}`} className='mx-1'>
                    {section}
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </div>
          <div className='navbar-end'></div>
        </div>
      </div>
      <main className='flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-950 to-[#1e210c] text-white'>
        <WIPHeader />
        <div className='flex flex-col items-center justify-center gap-12 px-4 py-16'>
          <StyledSection id={sections[0]}>
            <p className='text-xl font-extrabold'>{'Welcome to my website!'}</p>
            <p className='p-3 text-xl'></p>
            <p>{"I'm Kaden Hood."}</p>
            <p>{'a self taught software engineer.'}</p>
          </StyledSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <StyledSection id={sections[1]}>
            <p className='font-extrabold'>{'About Me'}</p>
            <p className='p-3 text-xl'></p>
            <p>{'I wear gloves, and go by Gloves online.'}</p>
            <p>{"And if you couldn't tell already, I like to code."}</p>
            <p className='p-3 text-xl'></p>
            <p>{'I started programming in my 2nd year of high school.'}</p>
          </StyledSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <StyledSection id={sections[2]}>
            <p>
              <strong>
                <Link className='fancy-link' href='https://meporobotics.com/'>
                  {'Mediapolis Robotics Club'}
                </Link>
              </strong>
            </p>
            <p>
              <Link className='fancy-link' href='https://frc-events.firstinspires.org/team/9061'>
                {'FIRST Inspires Robotics Team 9061'}
              </Link>
            </p>
            <p>{'Since 2023 - Present'}</p>
            <p className='p-3 text-xl'></p>
            <p>
              <strong>{'Role: '}</strong>
              {'Programmer'}
            </p>
            <p>
              <strong>{'Language: '}</strong>
              {'Java'}
            </p>
          </StyledSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <StyledSection id={sections[3]}>
            <p className='font-extrabold'>{'My Github Profile'}</p>
            <p className='p-3 text-xl'></p>
            <Suspense fallback={''}>
              <GitUser name='TheGloved1' />
            </Suspense>
          </StyledSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <StyledSection id={sections[4]}>
            <FileUploader />
          </StyledSection>
        </div>
      </main>
    </>
  )
}
