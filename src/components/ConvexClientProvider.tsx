'use client';

import { env } from '@/env';
import { useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ReactNode } from 'react';

let convex: ConvexReactClient | null = null;
let initError: Error | null = null;

try {
  const url = env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not set. Please configure your environment variables.');
  }
  convex = new ConvexReactClient(url);
} catch (error) {
  initError = error instanceof Error ? error : new Error(String(error));
}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (initError || !convex) {
    console.warn('Convex unavailable, rendering without Convex:', initError?.message);
    return <>{children}</>;
  }
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
