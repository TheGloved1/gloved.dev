import { getShortenedUrlAction } from '@/lib/actions';
import { notFound } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.pathname.split('/').pop();
  if (!linkId) return notFound();
  const url = await getShortenedUrlAction(linkId);
  if (!url) return notFound();
  return NextResponse.redirect(url);
}
