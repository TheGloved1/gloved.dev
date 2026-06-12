'use client';

import { env } from '@/env';
import { useAuth } from '@clerk/nextjs';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ReactNode } from 'react';

let convex: ConvexReactClient | null = null;
try {
  const url = env.NEXT_PUBLIC_CONVEX_URL;
  if (url) convex = new ConvexReactClient(url);
} catch {}

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) return <>{children}</>;
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
