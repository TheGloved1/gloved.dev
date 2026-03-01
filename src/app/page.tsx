'use client';
import AdminShow from '@/components/AdminShow';
import { PageVisits } from '@/components/PageVisits';
import ParticleText from '@/components/ParticleText';
import ThemeChanger from '@/components/ThemeChanger';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import Constants from '@/lib/constants';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons';
import {
  BookMarked,
  Calculator,
  CheckSquare,
  Cookie,
  Gamepad2,
  Home,
  Link2,
  MessageCircle,
  Palette,
  Scissors,
  Shield,
  Upload,
  Video,
  Zap,
} from 'lucide-react';
import DefaultPlayer from 'next-video/player';
import Link from 'next/link';
import React from 'react';

export default function Page(): React.JSX.Element {
  const isMobile = useIsMobile();

  interface AppItem {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    link: string;
  }

  const apps: AppItem[] = [
    { icon: Home, title: Constants.Home.title, description: Constants.Home.description, link: Constants.Home.link },
    { icon: MessageCircle, title: Constants.Chat.title, description: Constants.Chat.description, link: Constants.Chat.link },
    {
      icon: Upload,
      title: Constants.FileUploader.title,
      description: Constants.FileUploader.description,
      link: Constants.FileUploader.link,
    },
    {
      icon: Scissors,
      title: Constants.BGRemover.title,
      description: Constants.BGRemover.description,
      link: Constants.BGRemover.link,
    },
    { icon: Palette, title: Constants.Colors.title, description: Constants.Colors.description, link: Constants.Colors.link },
    {
      icon: Cookie,
      title: Constants.Cookies.title,
      description: Constants.Cookies.description,
      link: Constants.Cookies.link,
    },
    {
      icon: CheckSquare,
      title: Constants.Todos.title,
      description: Constants.Todos.description,
      link: Constants.Todos.link,
    },
    {
      icon: Gamepad2,
      title: Constants.Hangman.title,
      description: Constants.Hangman.description,
      link: Constants.Hangman.link,
    },
    { icon: Calculator, title: Constants.Calc.title, description: Constants.Calc.description, link: Constants.Calc.link },
    {
      icon: Link2,
      title: Constants.Shortener.title,
      description: Constants.Shortener.description,
      link: Constants.Shortener.link,
    },
    { icon: BookMarked, title: Constants.Fax.title, description: Constants.Fax.description, link: Constants.Fax.link },
    {
      icon: SiGithub,
      title: Constants.Github.title,
      description: Constants.Github.description,
      link: Constants.Github.link,
    },
  ];

  const adminApps: AppItem[] = [
    {
      icon: Shield,
      title: Constants.Admin.title,
      description: Constants.Admin.description,
      link: Constants.Admin.link,
    },
    { icon: Zap, title: Constants.Black.title, description: Constants.Black.description, link: Constants.Black.link },
    { icon: Palette, title: Constants.White.title, description: Constants.White.description, link: Constants.White.link },
    {
      icon: SiDiscord,
      title: Constants.Discord.title,
      description: Constants.Discord.description,
      link: Constants.Discord.link,
    },
  ];

  /**
   * Calculate the animation delay for a given index.
   * The animation delay speeds up over time using exponential decay.
   * This creates a cascading effect that gets faster with each subsequent item.
   * @param index The index of the item in the array.
   * @param total The total number of items in the array.
   * @returns The animation delay in seconds.
   */
  const animationDelay = (index: number, total: number) => `${0.6 + (index / total) * Math.exp(-index * 0.04)}s`;

  /**
   * Renders a list of apps with their respective icons, titles, and descriptions.
   * Each app is rendered as a separate link with a fade-in animation.
   * The animation delay is calculated based on the index of the app.
   * @param apps A list of AppItem objects to render.
   * @returns A JSX element containing the rendered apps.
   */
  function renderApps(apps: AppItem[]): React.JSX.Element {
    return (
      <div className='flex max-w-[1600px] flex-wrap justify-center gap-4'>
        {apps.map((app, index) => (
          <div
            key={app.link}
            className='fadeIn basis-full sm:basis-1/2 lg:basis-[30%] xl:basis-[22%]'
            style={{ animationDelay: animationDelay(index, apps.length) }}
          >
            <Link
              className='group flex h-full w-full flex-col justify-center gap-4 rounded-xl bg-gradient-to-br from-white/5 to-white/10 p-6 text-white transition-all duration-300 hover:scale-105 hover:from-white/10 hover:to-white/20 hover:shadow-[0_0_20px_rgba(186,85,211,0.5)]'
              href={app.link}
              prefetch
            >
              <app.icon className='h-8 w-8 self-center' />
              <h3 className='text-center text-lg font-bold'>
                <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                  {app.title} {'->'}
                </span>
              </h3>
              <div className='text-center text-sm'>{app.description}</div>
            </Link>
          </div>
        ))}
      </div>
    );
  }

  return (
    <ThemeChanger>
      <style
        dangerouslySetInnerHTML={{
          __html: `.fadeIn { opacity: 0; animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { to { opacity: 1; } }`,
        }}
      />
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
      <div className='container relative flex flex-col items-center justify-center gap-8 px-1 py-16 md:px-4'>
        <div className='absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-purple-900/10 to-transparent'></div>
        {/* Old Heading */}
        {isMobile && (
          <h1
            className='text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]'
            style={{ textShadow: '0 0 10px rgba(186,85,211,0.5)' }}
          >
            gloved<span className='text-[hsl(280,100%,40%)]'>.</span>dev
          </h1>
        )}

        {/* New Heading */}
        {!isMobile && (
          <ParticleText text='gloved.dev' size={100} hoverColor='#4B0082' particleCount={8000} edgeComplexity={5} />
        )}
        {renderApps(apps)}
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
            <DefaultPlayer autoPlay loop src={'/gource.webm'} className='max-h-[75vh]' />
          </DialogContent>
        </Dialog>

        <AdminShow>
          <div className='divider mx-auto w-[75vw] max-w-[1000px] items-center self-center' />
          <h2 className='text-3xl font-bold'>
            <u>{'Admin Stuff'}</u>
          </h2>
          {renderApps(adminApps)}
        </AdminShow>
      </div>
      <div className='divider mx-auto w-[75vw] max-w-[1000px] items-center self-center' />
      <div className='px-30 container flex flex-col items-center gap-1 self-center px-4 py-4 text-xs md:text-sm lg:text-base'>
        <p className='p-4 text-sm'>
          {'Help me improve the site and '}
          <Button asChild variant='outline' size='sm'>
            <Link href={'https://crotus.io/gloves/review'} target='_blank'>
              Write a review!
            </Link>
          </Button>
        </p>
      </div>
      <PageVisits />
    </ThemeChanger>
  );
}
