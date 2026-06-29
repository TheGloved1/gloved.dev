'use client';

import { env } from '@/env';
import { deleteAllLocalData, getLocalMessages, getLocalThreads } from '@/lib/chat-store';
import { setDebugAdmin } from '@/lib/debug';
import { useAuth, useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import { ConvexReactClient, useConvex } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

function DebugAdminSetter() {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.isAdmin === true;
  useEffect(() => {
    setDebugAdmin(isAdmin);
  }, [isAdmin]);
  return null;
}

function LocalDataMigrator() {
  const { isSignedIn, isLoaded } = useUser();
  const convex = useConvex();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || busy) return;
    if (sessionStorage.getItem('gloved_chat_migrated')) return;

    const localThreads = getLocalThreads();
    if (localThreads.length === 0) {
      sessionStorage.setItem('gloved_chat_migrated', 'true');
      return;
    }

    const migrate = async () => {
      setBusy(true);
      let count = 0;
      for (const thread of localThreads) {
        const msgs = getLocalMessages(thread.id);
        if (msgs.length === 0) continue;
        try {
          const result = await convex.mutation(api.messages.importThread, {
            title: thread.title,
            externalId: thread.id,
            messages: msgs.map((m) => ({
              content: m.content,
              role: m.role,
              model: m.model,
              status: m.status,
              reasoning: m.reasoning,
              tools: m.tools,
              attachments: m.attachments,
              externalId: m.id,
              createdAt: new Date(m.created_at).getTime(),
              updatedAt: new Date(m.updated_at).getTime(),
            })),
          });
          if (!result.skipped) count++;
        } catch (e) {
          console.error('[MIGRATE] Failed to import thread', thread.id, e);
        }
      }
      if (count > 0) {
        deleteAllLocalData();
        toast.success(`Migrated ${count} chat${count > 1 ? 's' : ''} to your account`);
      }
      sessionStorage.setItem('gloved_chat_migrated', 'true');
      setBusy(false);
    };

    migrate();
  }, [isLoaded, isSignedIn, convex, busy]);

  return null;
}

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
      <DebugAdminSetter />
      <LocalDataMigrator />
      {children}
    </ConvexProviderWithClerk>
  );
}
