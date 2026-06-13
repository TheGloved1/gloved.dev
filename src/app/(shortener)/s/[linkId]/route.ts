import { getConvexClient } from '@/lib/convex-server';
import { api } from '@convex/_generated/api';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

function isValidRedirectUrl(url: string): boolean {
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.pathname.split('/').pop();
  if (!linkId) return notFound();

  const client = getConvexClient();
  const url = await client.query(api.shortUrls.getById, { shortId: linkId });
  if (!url) return notFound();

  if (!isValidRedirectUrl(url)) {
    console.error(`Invalid redirect URL detected: ${url}`);
    return notFound();
  }

  return NextResponse.redirect(url);
}
