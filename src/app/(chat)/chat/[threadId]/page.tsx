'use client';
import PageLoader from '@/components/PageLoader';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ThreadMessages = dynamic(() => import('./_components/ThreadMessages'), { ssr: false });

export default function Page(): React.JSX.Element {
  return (
    <Suspense fallback={<PageLoader />}>
      <ThreadMessages />
    </Suspense>
  );
}
