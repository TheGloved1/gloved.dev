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

function AppCard({ app, index }: { app: AppItem; index: number }): React.JSX.Element {
  const [hovering, setHovering] = useState(false);
  return (
    <div
      key={app.link}
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
            
            .font-display {
              font-family: 'Syne', sans-serif;
            }
            
            .font-mono-industrial {
              font-family: 'Space Grotesk', monospace;
            }
            
            .noise-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              pointer-events: none;
              z-index: 9999;
              opacity: 0.03;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
              background-size: cover;
              background-repeat: no-repeat;
            }
            
            .grid-pattern {
              background-image:
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
              background-size: 60px 60px;
              background-position: 0 0, 0 0;
              background-repeat: repeat;
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              pointer-events: none;
              z-index: 1;
            }
            
            .glow-line {
              box-shadow:
                0 0 20px rgba(236, 72, 153, 0.5),
                0 0 40px rgba(236, 72, 153, 0.2);
            }
            
            .brutal-shadow {
              box-shadow: 6px 6px 0 rgba(236, 72, 153, 0.8);
            }
            
            .brutal-shadow-sm {
              box-shadow: 3px 3px 0 rgba(236, 72, 153, 0.6);
            }
            
            @keyframes glitch {
              0%,
              100% {
                transform: translate(0);
              }
              20% {
                transform: translate(-2px, 2px);
              }
              40% {
                transform: translate(-2px, -2px);
              }
              60% {
                transform: translate(2px, 2px);
              }
              80% {
                transform: translate(2px, -2px);
              }
            }
            
            .glitch-text:hover {
              animation: glitch 0.3s ease infinite;
            }
            
            .fadeIn { opacity: 0; animation: fadeIn 0.5s ease-out forwards; } 
            @keyframes fadeIn { to { opacity: 1; } }
          `,
        }}
      />
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
            <span className='glitch-text'>GLOVED</span>
            <span className='text-fuchsia-500'>.</span>
            <span className='glitch-text'>DEV</span>
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
