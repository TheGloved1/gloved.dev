'use client';

import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { ConvexHttpClient } from 'convex/browser';

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    client = new ConvexHttpClient(url);
  }
  return client;
}

export async function ensureConvexThread(threadId: string, userId?: string): Promise<Id<'threads'> | null> {
  try {
    const client = getConvexClient();
    const existing = await client.query(api.threads.getByExternalId, { externalId: threadId });
    if (existing) return existing._id;
    return await client.mutation(api.threads.create, {
      title: 'New Chat',
      userId,
      externalId: threadId,
    });
  } catch {
    return null;
  }
}
