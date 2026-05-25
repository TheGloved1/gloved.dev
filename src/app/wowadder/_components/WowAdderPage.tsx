'use client';

import PageBack from '@/components/PageBack';
import { Button } from '@/components/ui/button';
import Constants from '@/lib/constants';
import {
  Boxes,
  CloudDownload,
  Cpu,
  ExternalLink,
  Palette,
  Puzzle,
  Search,
  ShieldCheck,
  Wrench,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

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
    description:
      'Connects directly to the CurseForge Core API v2. No CurseForge account needed. No ads. No telemetry.',
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

export default function WowAdderPage(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0a0a] text-white selection:bg-amber-500/30">
      <div className="grid-pattern pointer-events-none fixed inset-0" />
      <div className="noise-overlay" />

      <PageBack stayTop btnClassName="brutal-shadow-sm border border-amber-500/50 bg-amber-500/10 text-xs text-white hover:bg-amber-500/20" />

      {/* Hero */}
      <section className="relative flex flex-col items-center px-4 pb-12 pt-20 sm:pb-16 sm:pt-28 lg:pt-32">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 sm:h-14 sm:w-14 lg:h-16 lg:w-16">
            <Boxes className="h-6 w-6 text-amber-500 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
              WowAdder
            </h1>
            <p className="font-mono-industrial mt-1 text-xs text-white/50 sm:text-sm">
              A lightweight, native World of Warcraft addon manager
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-center font-mono-industrial text-sm leading-relaxed text-white/60 sm:text-base">
          Built with Tauri v2, React 19, and the CurseForge Core API v2.
          <br />
          <span className="font-semibold text-amber-400">No Electron. No ads. No accounts. Just addons.</span>
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="https://github.com/TheGloved1/WowAdder" target="_blank" rel="noopener noreferrer">
            <Button className="brutal-shadow border border-amber-500/50 bg-amber-500/10 text-sm text-white hover:bg-amber-500/20">
              <ExternalLink className="h-4 w-4" />
              View on GitHub
            </Button>
          </Link>
          <Link href="https://github.com/TheGloved1/WowAdder/releases" target="_blank" rel="noopener noreferrer">
            <Button className="brutal-shadow border border-amber-500 bg-amber-500 text-sm font-semibold text-black hover:bg-amber-400">
              <CloudDownload className="h-4 w-4" />
              Download Latest Release
            </Button>
          </Link>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-line mx-auto w-3/4 max-w-2xl" />

      {/* Features */}
      <section className="relative px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display mb-10 text-center text-2xl font-bold uppercase tracking-tight text-amber-400 sm:text-3xl">
            Features
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="brutal-shadow-sm rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/10"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                  <feature.icon className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="font-display text-sm font-bold uppercase tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="font-mono-industrial mt-1 text-xs leading-relaxed text-white/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-line mx-auto w-3/4 max-w-2xl" />

      {/* How It's Different */}
      <section className="relative px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display mb-10 text-center text-2xl font-bold uppercase tracking-tight text-amber-400 sm:text-3xl">
            How It&apos;s Different
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="brutal-shadow-sm rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/10"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10">
                  <item.icon className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="font-display text-sm font-bold uppercase tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="font-mono-industrial mt-1 text-xs leading-relaxed text-white/50">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-line mx-auto w-3/4 max-w-2xl" />

      {/* Tech Stack */}
      <section className="relative px-4 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display mb-10 text-center text-2xl font-bold uppercase tracking-tight text-amber-400 sm:text-3xl">
            Tech Stack
          </h2>
          <div className="overflow-hidden rounded-xl border border-amber-500/20">
            <table className="w-full">
              <tbody>
                {techStack.map((item, i) => (
                  <tr
                    key={item.label}
                    className={
                      i % 2 === 0 ? 'bg-amber-500/5' : 'bg-transparent'
                    }
                  >
                    <td className="font-mono-industrial px-5 py-3 text-xs font-semibold uppercase tracking-wider text-amber-400">
                      {item.label}
                    </td>
                    <td className="font-mono-industrial px-5 py-3 text-xs text-white/70">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative px-4 pb-20 pt-8 sm:pb-28 sm:pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="glow-line mx-auto mb-8 w-3/4 max-w-2xl" />
          <p className="font-mono-industrial text-sm text-white/40">
            Windows (MSI installer) — other platforms can build from source
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="https://github.com/TheGloved1/WowAdder"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="brutal-shadow border border-amber-500/50 bg-amber-500/10 text-sm text-white hover:bg-amber-500/20">
                <ExternalLink className="h-4 w-4" />
                View Source
              </Button>
            </Link>
            <Link href={Constants.Github.link}>
              <Button className="brutal-shadow-sm border border-white/20 bg-white/5 text-sm text-white/70 hover:bg-white/10">
                More Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
