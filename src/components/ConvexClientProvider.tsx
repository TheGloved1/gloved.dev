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
  if (initError) {
    return (
      <div style={{ padding: '2rem', color: 'red', fontFamily: 'monospace' }}>
        <h1>Convex Configuration Error</h1>
        <p>{initError.message}</p>
        <p>Please ensure NEXT_PUBLIC_CONVEX_URL is set in your .env.local file.</p>
      </div>
    );
  }
  if (!convex) return <>{children}</>;
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
