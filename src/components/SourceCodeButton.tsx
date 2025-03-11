'use client';
import { useIsMobile } from '@/hooks/use-mobile';
import Constants from '@/lib/constants';
import { Code2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Button } from './ui/button';

export default function SourceCodeButton(): React.JSX.Element | null {
  const location = usePathname();
  const isMobile = useIsMobile();
  const sourceCodeUrl = `${Constants.GITHUB_URL}${location}/page.tsx`;

  return isMobile ? null : (
      <Link href={sourceCodeUrl} target='_blank' rel='noopener noreferrer'>
        <Button
          className='group fixed bottom-2 right-2 z-50 rounded-full p-2 text-white hover:bg-gray-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'
          aria-label='View Source Code'
        >
          <Code2 />
          <span className='hidden md:group-hover:inline'>View Source Code</span>
        </Button>
      </Link>
    );
}
