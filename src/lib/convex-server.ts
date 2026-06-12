import { env } from '@/env';
import { ConvexHttpClient } from 'convex/browser';

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!client) {
    const url = env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error('NEXT_PUBLIC_CONVEX_URL is not set');
    client = new ConvexHttpClient(url);
  }
  return client;
}
