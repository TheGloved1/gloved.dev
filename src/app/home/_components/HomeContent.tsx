'use client';
import GitUser from '@/components/GitUser';
import ObserverSection from '@/components/ObserverSection';
import ScrollLink from '@/components/ScrollLink';
import ThemeChanger from '@/components/ThemeChanger';
import { Button } from '@/components/ui/button';
import { apps } from '@/lib/apps';
import { animationDelay } from '@/lib/utils';
import { SiGithub } from '@icons-pack/react-simple-icons';
import { motion } from 'framer-motion';
import { ChevronLeft, Home, Upload, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import Dropdown from './Dropdown';

const sections = [
  { id: 'Welcome', title: 'Welcome', icon: Home },
  { id: 'Robotics', title: 'Robotics', icon: User },
  { id: 'Github', title: 'Github', icon: SiGithub },
  { id: 'Projects', title: 'Projects', icon: Upload },
];

export default function HomeContent(): React.JSX.Element {
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
      <div className='fixed left-0 right-0 top-0 z-[1000] backdrop-blur-sm'>
        <div className='border-b border-fuchsia-500/30 bg-[#0a0a0a]/80'>
          <div className='flex items-center justify-between px-4 py-3'>
            <div className='flex items-center gap-2'>
              <Link href={'/'}>
                <Button className='brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs hover:bg-fuchsia-500/20'>
                  <ChevronLeft className='h-4 w-4' />
                  <span className='font-mono-industrial hidden p-1 sm:block'>{'BACK'}</span>
                </Button>
              </Link>
            </div>
            <div className='hidden items-center gap-1 md:flex'>
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: parseFloat(animationDelay(index, sections.length, false)) }}
                >
                  <ScrollLink href={`#${section.id}`}>
                    <Button
                      variant='ghost'
                      className='font-mono-industrial brutal-shadow-sm mx-1 border border-white/10 bg-white/5 text-xs hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
                    >
                      <section.icon className='mr-2 h-4 w-4' />
                      {section.title}
                    </Button>
                  </ScrollLink>
                </motion.div>
              ))}
            </div>
            <div className='flex items-center gap-2'>
              <h1 className='font-display glitch-text p-2 text-lg font-extrabold tracking-tight text-white'>
                gloved<span className='text-fuchsia-500'>.</span>dev
              </h1>
              <div className='md:hidden'>
                <Dropdown sections={sections.map((s) => s.title)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='container relative flex min-h-screen flex-col items-center justify-center gap-8 px-1 py-16 md:px-4'>
        <div className='fixed inset-0 -z-10 bg-[#0a0a0a]'></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex w-full max-w-[1600px] flex-col items-center justify-center gap-12 px-4 py-16'
        >
          <ObserverSection id={sections[0].id}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='space-y-4 text-center'
            >
              <div className='mb-8 flex items-center justify-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <Home className='h-6 w-6 text-fuchsia-400' />
                </div>
                <h1 className='font-display glitch-text text-4xl font-bold uppercase tracking-tight text-white'>Welcome</h1>
              </div>
              <p className='font-display text-xl font-extrabold text-white'>{'Welcome to my website!'}</p>
              <p className='font-mono-industrial text-lg text-white/70'>{'Here you can find my various projects'}</p>
              <p className='font-mono-industrial text-lg text-white/50'>
                {'and other things I have done or find interesting'}
              </p>
            </motion.div>
          </ObserverSection>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='mx-auto flex w-[75vw] max-w-[1000px] items-center'
          >
            <div className='flex h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' />
          </motion.div>
          <ObserverSection id={sections[1].id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className='space-y-4 text-center'
            >
              <div className='mb-8 flex items-center justify-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <User className='h-6 w-6 text-fuchsia-400' />
                </div>
                <h1 className='font-display glitch-text text-4xl font-bold uppercase tracking-tight text-white'>Robotics</h1>
              </div>
              <div className='space-y-2'>
                <p className='font-mono-industrial text-lg'>
                  <strong>
                    <Link
                      className='fancy-link text-fuchsia-400 transition-colors hover:text-fuchsia-300'
                      href='https://meporobotics.com/'
                    >
                      {'Mediapolis Robotics Club'}
                    </Link>
                  </strong>
                </p>
                <p className='font-mono-industrial text-lg'>
                  <Link
                    className='fancy-link text-fuchsia-400 transition-colors hover:text-fuchsia-300'
                    href='https://frc-events.firstinspires.org/team/9061'
                  >
                    {'FIRST Inspires Robotics Team 9061'}
                  </Link>
                </p>
                <p className='font-mono-industrial text-white/50'>{'Since 2023 - Present'}</p>
                <div className='mt-4 flex justify-center gap-8'>
                  <div className='text-center'>
                    <p className='font-display text-sm font-bold uppercase text-fuchsia-400'>{'Roles'}</p>
                    <p className='font-mono-industrial text-white/70'>{'Programmer & Mentor'}</p>
                  </div>
                  <div className='text-center'>
                    <p className='font-display text-sm font-bold uppercase text-fuchsia-400'>{'Language'}</p>
                    <p className='font-mono-industrial text-white/70'>{'Java'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </ObserverSection>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className='mx-auto flex w-[75vw] max-w-[1000px] items-center'
          >
            <div className='flex h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' />
          </motion.div>

          <ObserverSection id={sections[2].id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='space-y-4 text-center'
            >
              <div className='mb-8 flex items-center justify-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <SiGithub className='h-6 w-6 text-fuchsia-400' />
                </div>
                <h1 className='font-display glitch-text text-4xl font-bold uppercase tracking-tight text-white'>Github</h1>
              </div>
              <div className='brutal-shadow-sm rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-8'>
                <GitUser name='TheGloved1' />
              </div>
            </motion.div>
          </ObserverSection>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className='mx-auto flex w-[75vw] max-w-[1000px] items-center'
          >
            <div className='flex h-px flex-1 bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent' />
          </motion.div>

          <ObserverSection id={sections[3].id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className='space-y-4 text-center'
            >
              <div className='mb-8 flex items-center justify-center gap-4'>
                <div className='flex h-12 w-12 items-center justify-center border border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <Upload className='h-6 w-6 text-fuchsia-400' />
                </div>
                <h1 className='font-display glitch-text text-4xl font-bold uppercase tracking-tight text-white'>Projects</h1>
              </div>
              <div className='mx-auto max-w-2xl'>
                <div className='flex flex-wrap justify-center gap-3'>
                  {apps.map((app, index) => {
                    if (app.title === 'Home')
                      return (
                        <motion.div
                          key={app.title}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 + index * 0.05 }}
                        >
                          <Link href={'/'}>
                            <div className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10'>
                              <app.icon className='h-4 w-4 text-white/60 transition-colors duration-300 group-hover:text-fuchsia-400' />
                              <span className='text-sm font-medium text-white/80 transition-colors duration-300 group-hover:text-white'>
                                {'Main Page'}
                              </span>
                            </div>
                          </Link>
                        </motion.div>
                      );

                    return (
                      <motion.div
                        key={app.link}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                      >
                        <Link href={app.link}>
                          <div className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10'>
                            <app.icon className='h-4 w-4 text-white/60 transition-colors duration-300 group-hover:text-fuchsia-400' />
                            <span className='text-sm font-medium text-white/80 transition-colors duration-300 group-hover:text-white'>
                              {app.title}
                            </span>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </ObserverSection>
        </motion.div>
      </div>
    </ThemeChanger>
  );
}
