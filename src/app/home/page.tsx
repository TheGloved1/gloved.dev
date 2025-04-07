import FileUploader from '@/components/FileUploader';
import GitUser from '@/components/GitUser';
import ObserverSection from '@/components/ObserverSection';
import ScrollLink from '@/components/ScrollLink';
import { Button } from '@/components/ui/button';
import Constants from '@/lib/constants';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import Dropdown from './_components/Dropdown';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.Home.title}`,
  description: Constants.Home.description,
  icons: 'https://avatars.githubusercontent.com/u/96776176?v=4',
};

const sections = ['Welcome', 'Robotics', 'Github', 'File Uploader'];

export default function Page(): React.JSX.Element {
  return (
    <>
      <div className='fixed left-0 right-0 top-0 z-[1000]'>
        <div className='navbar bg-zinc-800'>
          <div className='navbar-start'>
            <Link href={'/'}>
              <Button variant='ghost'>
                <ChevronLeft />
                <span className='hidden p-1 sm:block'>{'Back'}</span>
              </Button>
            </Link>
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
          <div className='navbar-end hidden md:flex'>
            <h1 className='p-2 text-lg font-extrabold tracking-tight text-white'>
              gloved<span className='text-[hsl(280,93%,72%)]'>.</span>dev
            </h1>
          </div>
          <div className='navbar-end flex md:hidden'>
            <Dropdown sections={sections} />
          </div>
        </div>
      </div>
      <div>
        {/* <WIPHeader /> */}
        <div className='flex flex-col items-center justify-center gap-12 px-4 py-16'>
          <ObserverSection id={sections[0]}>
            <p className='text-xl font-extrabold'>{'Welcome to my website!'}</p>
            <p className='p-3 text-xl'></p>
            <p>{"I'm Kaden Hood."}</p>
            <p>{'a self taught software engineer.'}</p>
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          {/* <ObserverSection id={sections[1]}>
            <p className='font-extrabold'>{'About Me'}</p>
            <p className='p-3 text-xl'></p>
            <p>{'I wear gloves, and go by Gloves online.'}</p>
            <p>{"And if you couldn't tell already, I like to code."}</p>
            <p className='p-3 text-xl'></p>
            <p>{'I started programming in my 2nd year of high school.'}</p>
          </ObserverSection> */}
          {/* <div className='divider w-[75vw] max-w-[1000px]' /> */}
          <ObserverSection id={sections[1]}>
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
              <strong>{'Roles: '}</strong>
              {'Programmer & Mentor'}
            </p>
            <p>
              <strong>{'Language: '}</strong>
              {'Java'}
            </p>
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <ObserverSection id={sections[2]}>
            <p className='font-extrabold'>{'My Github Profile'}</p>
            <p className='p-3 text-xl'></p>
            <GitUser name='TheGloved1' />
          </ObserverSection>
          <div className='divider w-[75vw] max-w-[1000px]' />
          <ObserverSection id={sections[3]}>
            <FileUploader />
            <Link href={'/file-uploader'} className='group btn m-4 text-xl'>
              Standalone Version{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                -&gt;
              </span>
            </Link>
          </ObserverSection>
        </div>
      </div>
    </>
  );
}
