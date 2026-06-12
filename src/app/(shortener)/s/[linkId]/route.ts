import { env } from '@/env';
import { api } from '@convex/api';
import { ConvexHttpClient } from 'convex/browser';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.pathname.split('/').pop();
  if (!linkId) return notFound();

  const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
  const url = await client.query(api.shortUrls.getById, { shortId: linkId });
  if (!url) return notFound();
  return NextResponse.redirect(url);
}
