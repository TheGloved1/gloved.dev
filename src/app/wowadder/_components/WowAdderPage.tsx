'use client';

import PageBack from '@/components/PageBack';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Constants from '@/lib/constants';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Boxes, CloudDownload, Cpu, ExternalLink, Palette, Puzzle, Search, ShieldCheck, Wrench, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import '../wow.css';
import ReleasesTab from './ReleasesTab';

const features = [
  {
    icon: Search,
    title: 'Browse & Search',
    description: 'Find addons on CurseForge by name, category, or game version',
  },
  {
    icon: Puzzle,
    title: 'Category Sidebar',
    description: 'Browse 60+ CurseForge categories with multiple sort options',
  },
  {
    icon: CloudDownload,
    title: 'One-Click Install',
    description: 'Install directly to your Interface/AddOns folder',
  },
  {
    icon: ShieldCheck,
    title: 'Version-Aware Filtering',
    description: 'View only compatible files per WoW patch',
  },
  {
    icon: Search,
    title: 'External Addon Detection',
    description: 'Scans for unmanaged addons and matches them to CurseForge',
  },
  {
    icon: Boxes,
    title: 'Batch Sync',
    description: 'Match and adopt multiple external addons at once',
  },
];

const differentiators = [
  {
    icon: Cpu,
    title: 'Lightweight & Native',
    description:
      'Built on Tauri v2 with a Rust backend and a compiled MSI installer (~5 MB). No Electron overhead, no bundled Chromium.',
  },
  {
    icon: ShieldCheck,
    title: 'No Account, No Ads',
    description: 'Connects directly to the CurseForge Core API v2. No CurseForge account needed. No ads. No telemetry.',
  },
  {
    icon: CloudDownload,
    title: 'CurseForge Downloads',
    description:
      'By default, installing opens the CurseForge download page directly in your browser, supporting addon authors by counting your downloads.',
  },
  {
    icon: Wrench,
    title: 'Smart Addon Detection',
    description:
      'Scans your Interface/AddOns folder by parsing .toc metadata files. Detects addons installed outside WowAdder and can match and adopt them.',
  },
  {
    icon: Zap,
    title: 'Safe Upgrades',
    description:
      'Downloads and extracts the new version before removing old folders — no window where addon files are missing.',
  },
  {
    icon: Palette,
    title: 'Customizable Themes',
    description:
      'Choose from 5 color schemes inspired by World of Warcraft: Classic, Emerald, Crimson, Night Elf, and Frost.',
  },
];

const techStack = [
  { label: 'Desktop Framework', value: 'Tauri v2 (Rust backend)' },
  { label: 'Frontend', value: 'React 19 + TypeScript' },
  { label: 'Data Fetching', value: 'TanStack Query v5' },
  { label: 'Styling', value: 'Tailwind CSS v4' },
  { label: 'API Client', value: 'curseforge-v2' },
  { label: 'Routing', value: 'React Router v7' },
  { label: 'Markdown', value: 'react-markdown' },
  { label: 'Build Tool', value: 'Vite 7' },
  { label: 'Package Manager', value: 'Bun' },
  { label: 'Installer', value: 'WiX MSI' },
];

enum WowAdderTab {
  Overview = 'overview',
  Releases = 'releases',
}

function FadeInSection({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function WowAdderPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<WowAdderTab>(WowAdderTab.Overview);

  return (
    <div className='font-wow-body relative min-h-screen bg-[#0c0a09] text-[#faf6f0] selection:bg-[#a16207]/30'>
      <div className='wow-scanline pointer-events-none fixed inset-0' />

      <PageBack
        stayTop
        className='z-50'
        btnClassName='border border-[#3f3a36] bg-[#1c1917] text-xs text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_8px_rgba(161,98,7,0.2)]'
      />

      {/* Hero */}
      <section className='relative px-4 pb-8 pt-24 sm:pb-12 sm:pt-32 lg:pt-40'>
        <FadeInSection className='flex flex-col items-center'>
          <div className='relative mb-6'>
            <div className='relative flex h-16 w-16 items-center justify-center rounded-sm border border-[#3f3a36] bg-[#1c1917] sm:h-20 sm:w-20'>
              {/* <div className='pointer-events-none absolute inset-px rounded-sm border border-[#a16207]/20' /> */}
              {/* <Boxes className='relative h-8 w-8 text-[#fbbf24] sm:h-10 sm:w-10' /> */}
              <img src='https://github.com/TheGloved1/WowAdder/blob/main/public/logo.png?raw=true' alt='WowAdder logo' />
            </div>
          </div>

          <div className='text-center'>
            <h1 className='font-wow-heading text-4xl font-bold tracking-wide text-[#fbbf24] sm:text-5xl lg:text-6xl'>
              WowAdder
            </h1>
            <p className='font-wow-body mt-3 text-sm text-[#a8a29e] sm:text-base'>
              A lightweight, native World of Warcraft addon manager
            </p>
          </div>

          <div className='my-6 flex w-full max-w-xs items-center gap-2'>
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
            <div className='h-1.5 w-1.5 rotate-45 border border-[#a16207]/60' />
            <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
          </div>

          <p className='font-wow-body max-w-2xl text-center text-sm leading-relaxed text-[#a8a29e] sm:text-base'>
            Built with Tauri v2, React 19, and the CurseForge Core API v2.
            <br />
            <span className='font-semibold text-[#fbbf24]/90'>No Electron. No ads. No accounts. Just addons.</span>
          </p>

          <div className='mt-8 flex flex-wrap justify-center gap-3'>
            <Link href='https://github.com/TheGloved1/WowAdder' target='_blank' rel='noopener noreferrer'>
              <Button className='border border-[#3f3a36] bg-[#1c1917] text-xs text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_8px_rgba(161,98,7,0.2)]'>
                <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
                View on GitHub
              </Button>
            </Link>
            <Link href='/wowadder/downloads'>
              <Button className='border border-[#f59e0b] bg-[#fbbf24] px-4 text-xs font-bold tracking-wide text-[#0c0a09] shadow-[0_0_6px_rgba(251,191,36,0.15)] transition-all duration-150 hover:bg-[#fbbf24]/90 active:bg-[#d97706]'>
                <CloudDownload className='mr-1.5 h-3.5 w-3.5' />
                Download
              </Button>
            </Link>
          </div>
        </FadeInSection>
      </section>

      {/* Divider */}
      <div className='px-4'>
        <div className='mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
      </div>

      {/* Tab bar */}
      <div className='relative px-4 pt-8 sm:pt-10'>
        <Tabs value={activeTab} onValueChange={setActiveTab as (value: string) => void} className='mx-auto max-w-5xl'>
          <div className='flex justify-center'>
            <TabsList className='gap-0.5 rounded-sm border border-[#292524] bg-[#0c0a09] p-0.5'>
              <TabsTrigger
                value={WowAdderTab.Overview}
                className={cn(
                  'font-wow-heading rounded-sm px-5 py-1.5 text-xs tracking-wide transition-all duration-150',
                  activeTab === WowAdderTab.Overview ?
                    'bg-[#1c1917] text-[#fbbf24] shadow-[0_0_6px_rgba(251,191,36,0.1)]'
                  : 'text-[#a8a29e] hover:bg-[#292524] hover:text-[#faf6f0]',
                )}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value={WowAdderTab.Releases}
                className={cn(
                  'font-wow-heading rounded-sm px-5 py-1.5 text-xs tracking-wide transition-all duration-150',
                  activeTab === WowAdderTab.Releases ?
                    'bg-[#1c1917] text-[#fbbf24] shadow-[0_0_6px_rgba(251,191,36,0.1)]'
                  : 'text-[#a8a29e] hover:bg-[#292524] hover:text-[#faf6f0]',
                )}
              >
                Releases
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='mt-0'>
            {/* Features */}
            <FadeInSection delay={100} className='mt-1 px-4 pt-16'>
              <div className='mx-auto max-w-5xl'>
                <div className='mb-10 text-center'>
                  <h2 className='font-wow-heading text-lg tracking-wide text-[#fbbf24]'>Features</h2>
                  <p className='font-wow-body mt-1.5 text-sm text-[#78716c]'>
                    Everything you need to manage your World of Warcraft addons
                  </p>
                </div>
                <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {features.map((feature) => (
                    <div
                      key={feature.title}
                      className='wow-card group p-4 transition-all duration-150 hover:shadow-[0_0_10px_rgba(161,98,7,0.1)] sm:p-5'
                    >
                      <div className='relative mb-3 flex h-10 w-10 items-center justify-center rounded-sm border border-[#3f3a36] bg-[#292524]'>
                        <div className='pointer-events-none absolute inset-px rounded-sm border border-[#a16207]/20' />
                        <feature.icon className='relative h-[18px] w-[18px] text-[#fbbf24] transition-colors duration-150 group-hover:text-[#fbbf24]' />
                      </div>
                      <h3 className='font-wow-heading text-sm tracking-wide text-[#faf6f0] transition-colors duration-150 group-hover:text-[#fbbf24]'>
                        {feature.title}
                      </h3>
                      <p className='font-wow-body mt-1 text-xs leading-relaxed text-[#a8a29e]'>{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Divider */}
            <div className='px-4'>
              <div className='mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[#a16207]/30 to-transparent' />
            </div>

            {/* How It's Different */}
            <FadeInSection delay={200} className='px-4 py-16 sm:py-20 lg:py-24'>
              <div className='mx-auto max-w-5xl'>
                <div className='mb-10 text-center'>
                  <h2 className='font-wow-heading text-lg tracking-wide text-[#fbbf24]'>How It&apos;s Different</h2>
                  <p className='font-wow-body mt-1.5 text-sm text-[#78716c]'>Built differently from the ground up</p>
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {differentiators.map((item) => (
                    <div
                      key={item.title}
                      className='wow-card group p-4 transition-all duration-150 hover:shadow-[0_0_10px_rgba(161,98,7,0.1)] sm:p-5'
                    >
                      <div className='relative mb-3 flex h-10 w-10 items-center justify-center rounded-sm border border-[#3f3a36] bg-[#292524]'>
                        <div className='pointer-events-none absolute inset-px rounded-sm border border-[#a16207]/20' />
                        <item.icon className='relative h-[18px] w-[18px] text-[#fbbf24] transition-colors duration-150 group-hover:text-[#fbbf24]' />
                      </div>
                      <h3 className='font-wow-heading text-sm tracking-wide text-[#faf6f0] transition-colors duration-150 group-hover:text-[#fbbf24]'>
                        {item.title}
                      </h3>
                      <p className='font-wow-body mt-1 text-xs leading-relaxed text-[#a8a29e]'>{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* Divider */}
            <div className='px-4'>
              <div className='mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-[#a16207]/30 to-transparent' />
            </div>

            {/* Tech Stack */}
            <FadeInSection delay={300} className='px-4 py-16 sm:py-20 lg:py-24'>
              <div className='mx-auto max-w-3xl'>
                <div className='mb-10 text-center'>
                  <h2 className='font-wow-heading text-lg tracking-wide text-[#fbbf24]'>Tech Stack</h2>
                  <p className='font-wow-body mt-1.5 text-sm text-[#78716c]'>Modern tools for a modern addon manager</p>
                </div>
                <div className='wow-card overflow-hidden'>
                  <table className='w-full'>
                    <tbody>
                      {techStack.map((item, i) => (
                        <tr key={item.label} className='transition-colors duration-150 hover:bg-[#292524]'>
                          <td className='font-wow-heading border-b border-[#292524] px-4 py-3 text-xs tracking-wide text-[#fbbf24]/80 sm:px-5'>
                            {item.label}
                          </td>
                          <td className='font-wow-body border-b border-[#292524] px-4 py-3 text-xs text-[#a8a29e] sm:px-5'>
                            {item.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeInSection>

            {/* Footer CTA */}
            <FadeInSection delay={400} className='px-4 pb-20 pt-8 sm:pb-28 sm:pt-12'>
              <div className='mx-auto max-w-2xl text-center'>
                <div className='my-8 flex items-center gap-2'>
                  <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
                  <div className='h-1.5 w-1.5 rotate-45 border border-[#a16207]/60' />
                  <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
                </div>
                <p className='font-wow-body text-sm text-[#78716c]'>
                  Windows (MSI installer) &mdash; other platforms can build from source
                </p>
                <div className='mt-6 flex flex-wrap justify-center gap-3'>
                  <Link href='https://github.com/TheGloved1/WowAdder' target='_blank' rel='noopener noreferrer'>
                    <Button className='border border-[#3f3a36] bg-[#1c1917] text-xs text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_8px_rgba(161,98,7,0.2)]'>
                      <ExternalLink className='mr-1.5 h-3.5 w-3.5' />
                      View Source
                    </Button>
                  </Link>
                  <Link href={Constants.Github.link}>
                    <Button className='border border-transparent bg-transparent text-xs text-[#78716c] transition-all duration-150 hover:border-[#a16207]/50 hover:text-[#fbbf24]'>
                      More Projects
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeInSection>
          </TabsContent>

          <TabsContent value='releases' className='mt-0'>
            <ReleasesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
