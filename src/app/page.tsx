'use client';
import AdminShow from '@/components/AdminShow';
import { CornerDecorations } from '@/components/CornerDecorations';
import { PageVisits } from '@/components/PageVisits';
import ParticleText from '@/components/ParticleText';
import ThemeChanger from '@/components/ThemeChanger';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { adminApps, apps, type AppItem } from '@/lib/apps';
import { animationDelay } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Video } from 'lucide-react';
import DefaultPlayer from 'next-video/player';
import Link from 'next/link';
import React, { useState } from 'react';

function AppCard({ key, app, index }: { key?: string; app: AppItem; index: number }): React.JSX.Element {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      key={key || app.link}
      className='fadeIn basis-full sm:basis-[45%] md:basis-[33%] lg:basis-[30%] xl:basis-[22%]'
      style={{ animationDelay: animationDelay(index, apps.length) }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link
        className='hover:brutal-shadow group relative flex h-full w-full flex-col justify-center gap-4 border-2 border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10'
        href={app.link}
        prefetch
      >
        {/* Corner decorations */}
        <CornerDecorations hovering={hovering} />

        <app.icon className='h-8 w-8 self-center text-fuchsia-400' />
        <h3 className='font-display text-center text-lg font-bold uppercase tracking-tight text-white'>
          <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
            {app.title} {'->'}
          </span>
        </h3>
        <div className='font-mono-industrial text-center text-xs text-white/50'>{app.description}</div>

        {/* Hover effect line */}
        <div className='absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
      </Link>
    </div>
  );
}

/**
 * Renders a list of apps with their respective icons, titles, and descriptions.
 * Each app is rendered as a separate link with a fade-in animation.
 * The animation delay is calculated based on the index of the app.
 * @param apps A list of AppItem objects to render.
 * @returns A JSX element containing the rendered apps.
 */
function AppGrid({ apps }: { apps: AppItem[] }): React.JSX.Element {
  return (
    <div className='flex max-w-[1600px] flex-wrap justify-center gap-6'>
      {apps.map((app, index) => (
        <AppCard key={app.link} app={app} index={index} />
      ))}
    </div>
  );
}
export default function Page(): React.JSX.Element {
  const isMobile = useIsMobile();

  return (
    <ThemeChanger>
      <div className='noise-overlay' />
      <div className='grid-pattern' />
      <div className='absolute left-0 top-0 flex items-center gap-2 rounded-br-lg border-b-2 border-r-2 border-fuchsia-500/30 bg-[#0a0a0a]/80 p-2 backdrop-blur-sm'>
        <div className='glow-line h-2 w-2 bg-fuchsia-500' />
        <SignedOut>
          <SignInButton mode={'modal'}>
            <div className='font-mono-industrial brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs hover:bg-fuchsia-500/20'>
              SIGN IN
            </div>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className='flex items-center gap-2'>
            <UserButton showName />
          </div>
        </SignedIn>
      </div>
      <div className='container relative flex min-h-screen flex-col items-center justify-center gap-8 px-1 py-16 md:px-4'>
        <div className='fixed inset-0 -z-10 bg-[#0a0a0a]'></div>
        {/* Old Heading */}
        {isMobile ?
          <h1 className='font-display text-xl font-extrabold uppercase tracking-tight text-white'>
            <span>GLOVED</span>
            <span className='text-fuchsia-500'>.</span>
            <span>DEV</span>
          </h1>
        : <ParticleText text='gloved.dev' size={100} hoverColor='#ec4899' edgeComplexity={5} />}
        <AppGrid apps={apps} />
        <Dialog>
          <DialogTrigger asChild>
            <Button className='font-mono-industrial brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs hover:bg-fuchsia-500/20'>
              <Video className='mr-2 inline-block' /> PROJECT HISTORY
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[75vh] border border-white/10 bg-[#0a0a0a]'>
            <DialogHeader>
              <DialogTitle className='font-display text-xl font-bold uppercase tracking-tight text-white'>
                Project History
              </DialogTitle>
              <DialogDescription className='font-mono-industrial text-xs text-white/50'>
                {
                  'The project is displayed as a tree where the root is the centre, folders are branches and files are leaves.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className='flex w-full items-center justify-center self-center'>
              <Link href={'/gource.webm'}>
                <Button className='font-mono-industrial brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs hover:bg-fuchsia-500/20'>
                  VIEW RAW
                </Button>
              </Link>
            </div>
            <DefaultPlayer autoPlay loop src={'/gource.webm'} className='max-h-[75vh]' />
          </DialogContent>
        </Dialog>

        <AdminShow>
          <div className='mx-auto flex w-[75vw] max-w-[1000px] items-center self-center'>
            <div className='flex h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' />
            <h2 className='font-display mx-4 text-2xl font-bold uppercase tracking-tight text-white'>{'Admin Stuff'}</h2>
            <div className='flex h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' />
          </div>
          <AppGrid apps={adminApps} />
        </AdminShow>
      </div>
      <div className='mx-auto flex w-[75vw] max-w-[1000px] items-center self-center'>
        <div className='flex h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' />
      </div>
      <div className='container flex flex-col items-center gap-1 self-center px-4 py-4 text-xs md:text-sm lg:text-base'>
        <p className='font-mono-industrial p-4 text-sm text-white/50'>
          {'Help me improve the site and '}
          <Button
            asChild
            variant='outline'
            size='sm'
            className='brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs hover:bg-fuchsia-500/20'
          >
            <Link href={'https://crotus.io/gloves/review'} target='_blank'>
              WRITE A REVIEW!
            </Link>
          </Button>
        </p>
      </div>
      <PageVisits />
    </ThemeChanger>
  );
}
