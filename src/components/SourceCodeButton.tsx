'use client';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import Constants from '@/lib/constants';
import { Code2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function SourceCodeButton(): React.JSX.Element | null {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const sourceCodeUrl =
    (
      (pathname.includes('-') && pathname.split('-').length === 5) ||
      pathname.includes('/welcome') ||
      pathname.includes('/faq')
    ) ?
      `${Constants.GITHUB_URL}${pathname.split('/').slice(0, -1).join('/')}/%5BthreadId%5D/page.tsx`
    : `${Constants.GITHUB_URL}${pathname == '/' ? '' : pathname}/page.tsx`;

  return isMobile ? null : (
      <Link prefetch as={sourceCodeUrl} href={sourceCodeUrl} target='_blank' rel='noopener noreferrer'>
        <Button
          className='group fixed bottom-2 right-2 z-50 min-h-8 min-w-8 rounded-full p-2 text-white hover:bg-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'
          aria-label='View Source Code'
        >
          <Code2 className='!size-5' />
          <span className='hidden md:group-hover:inline'>View Source Code</span>
        </Button>
      </Link>
    );
}
