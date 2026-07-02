'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CloudDownload, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Markdown, { Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import '../wow.css';
import ReleasesTab from './ReleasesTab';
import { TransitionLink } from './TransitionLink';

enum WowAdderTab {
  Overview = 'overview',
  Releases = 'releases',
}

function FadeInSection({
  children,
  delay = 0,
  className,
  from = 'left',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: from === 'left' ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const README_BASE = 'https://raw.githubusercontent.com/TheGloved1/WowAdder/refs/heads/main';
const README_URL = `${README_BASE}/README.md`;
const REPO_BLOB = 'https://github.com/TheGloved1/WowAdder/blob/main';

const readmeComponents: Components = {
  h1: ({ children, ...props }: any) => (
    <h1
      className='font-wow-heading mb-4 mt-10 border-b border-[#292524] pb-2 text-2xl font-bold tracking-wide text-[#fbbf24]'
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: any) => (
    <h2 className='font-wow-heading mb-3 mt-8 text-xl font-bold tracking-wide text-[#fbbf24]' {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className='font-wow-heading mb-2 mt-6 text-lg font-bold tracking-wide text-[#fbbf24]' {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: any) => (
    <h4 className='font-wow-heading mb-2 mt-4 text-base font-bold tracking-wide text-[#fbbf24]/90' {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }: any) => (
    <p className='font-wow-body mb-4 text-sm leading-relaxed text-[#a8a29e]' {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }: any) => {
    const isRelative = href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:');
    const resolvedHref = isRelative ? `${REPO_BLOB}/${href.replace(/^\.\//, '')}` : href;
    return (
      <a
        href={resolvedHref}
        className='text-[#f59e0b] no-underline transition-all duration-150 hover:underline'
        target='_blank'
        rel='noopener noreferrer'
        {...props}
      >
        {children}
      </a>
    );
  },
  strong: ({ children, ...props }: any) => (
    <strong className='font-semibold text-[#faf6f0]' {...props}>
      {children}
    </strong>
  ),
  code: ({ children, className, ...props }: any) => {
    const isInline = !className?.includes('language-');
    if (isInline && !String(children).includes('\n')) {
      return (
        <code className='mx-0.5 rounded-sm bg-[#292524] px-1 py-0.5 font-mono text-xs text-[#fbbf24]' {...props}>
          {children}
        </code>
      );
    }
    const language = className?.replace('language-', '') || 'plaintext';
    return (
      <pre className='mb-4 overflow-x-auto rounded-sm border border-[#3f3a36] bg-[#0c0a09] p-4'>
        <code className={`language-${language} font-mono text-xs text-[#e4e4e7]`} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  pre: ({ children, ...props }: any) => <>{children}</>,
  ul: ({ children, ...props }: any) => (
    <ul className='mb-4 list-disc pl-6 text-sm text-[#a8a29e] marker:text-[#a16207]' {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: any) => (
    <ol className='mb-4 list-decimal pl-6 text-sm text-[#a8a29e] marker:text-[#a16207]' {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className='mb-1 leading-relaxed' {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: any) => (
    <blockquote className='mb-4 border-l-2 border-[#fbbf24] pl-4 text-sm italic text-[#a8a29e]' {...props}>
      {children}
    </blockquote>
  ),
  hr: (props: any) => (
    <div className='my-8 flex items-center gap-2'>
      <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
      <div className='h-1.5 w-1.5 rotate-45 border border-[#a16207]/60' />
      <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#a16207]/40 to-transparent' />
    </div>
  ),
  img: ({ src, alt, ...props }: any) => {
    const resolvedSrc = src?.startsWith('http') ? src : `${README_BASE}/${src?.replace(/^\//, '')}`;
    return (
      <div className='my-4 overflow-hidden rounded-sm border border-[#3f3a36]'>
        <img src={resolvedSrc} alt={alt} className='w-full' {...props} />
      </div>
    );
  },
  table: ({ children, ...props }: any) => (
    <div className='wow-card mb-4 overflow-hidden'>
      <table className='w-full border-collapse' {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
  tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }: any) => (
    <tr className='transition-colors duration-150 hover:bg-[#292524]' {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }: any) => (
    <th
      className='font-wow-heading border-b border-[#292524] px-4 py-3 text-left text-xs tracking-wide text-[#fbbf24]/80'
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: any) => (
    <td className='border-b border-[#292524] px-4 py-3 text-xs text-[#a8a29e]' {...props}>
      {children}
    </td>
  ),
};

function ReadmeSection() {
  const [readme, setReadme] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(README_URL)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((text) => {
        if (!cancelled) setReadme(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <FadeInSection className='px-4 py-20'>
        <div className='mx-auto max-w-md text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-[#3f3a36] bg-[#292524]'>
            <ExternalLink className='h-5 w-5 text-[#a8a29e]' />
          </div>
          <p className='font-wow-body text-sm text-[#78716c]'>
            Couldn&apos;t load the README.{' '}
            <a
              href='https://github.com/TheGloved1/WowAdder'
              target='_blank'
              rel='noopener noreferrer'
              className='text-[#f59e0b] hover:underline'
            >
              View on GitHub
            </a>
          </p>
        </div>
      </FadeInSection>
    );
  }

  if (!readme) {
    return (
      <FadeInSection className='px-4 py-20'>
        <div className='mx-auto max-w-2xl'>
          {/* Skeleton blocks */}
          {[1, 2, 3].map((block) => (
            <div key={block} className='mb-8 animate-pulse'>
              <div className='mb-3 h-6 w-1/3 rounded-sm bg-[#292524]' />
              <div className='mb-2 h-3 w-full rounded-sm bg-[#292524]' />
              <div className='mb-2 h-3 w-5/6 rounded-sm bg-[#292524]' />
              <div className='mb-2 h-3 w-4/6 rounded-sm bg-[#292524]' />
            </div>
          ))}
        </div>
      </FadeInSection>
    );
  }

  return (
    <div className='px-4 py-12 sm:py-16'>
      <div className='mx-auto max-w-4xl'>
        <div className='wow-card p-6 sm:p-8 lg:p-10'>
          <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={readmeComponents}>
            {readme}
          </Markdown>
        </div>
      </div>
    </div>
  );
}

export default function WowAdderPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<WowAdderTab>(WowAdderTab.Overview);

  return (
    <>
      {/* Hero */}
      <section className='relative px-4 pb-8 pt-24 sm:pb-12 sm:pt-32 lg:pt-40'>
        <FadeInSection className='flex flex-col items-center'>
          <div className='relative mb-6'>
            <div className='relative flex h-16 w-16 items-center justify-center rounded-sm border border-[#3f3a36] bg-[#1c1917] sm:h-20 sm:w-20'>
              {/* <div className='pointer-events-none absolute inset-px rounded-sm border border-[#a16207]/20' /> */}
              {/* <Boxes className='relative h-8 w-8 text-[#fbbf24] sm:h-10 sm:w-10' /> */}
              <Image
                width={32}
                height={32}
                src='https://github.com/TheGloved1/WowAdder/blob/main/public/logo.png?raw=true'
                alt='WowAdder logo'
              />
            </div>
          </div>

          <div className='text-center'>
            <h1 className='font-wow-heading text-4xl font-bold tracking-wide text-[#fbbf24] sm:text-5xl lg:text-6xl'>
              WowAdder
            </h1>
            <p className='font-wow-body mt-3 text-sm text-[#a8a29e] sm:text-base'>
              A lightweight World of Warcraft addon manager
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
            <TransitionLink href='/wowadder/download'>
              <Button className='border border-[#f59e0b] bg-[#fbbf24] px-4 text-xs font-bold tracking-wide text-[#0c0a09] shadow-[0_0_6px_rgba(251,191,36,0.15)] transition-all duration-150 hover:bg-[#fbbf24]/90 active:bg-[#d97706]'>
                <CloudDownload className='mr-1.5 h-3.5 w-3.5' />
                Download
              </Button>
            </TransitionLink>
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
            <ReadmeSection />
          </TabsContent>

          <TabsContent value='releases' className='mt-0'>
            <ReleasesTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
