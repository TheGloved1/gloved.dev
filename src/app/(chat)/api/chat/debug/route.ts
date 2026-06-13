import { env } from '@/env';
import { NextRequest as Request, NextResponse as Response } from 'next/server';

function redactAndTruncate(data: any): string {
  const str = JSON.stringify(data);
  const truncated = str.length > 500 ? str.substring(0, 500) + '...[truncated]' : str;
  return truncated.replace(/("(?:password|token|key|secret|authorization)":\s*")[^"]*(")/gi, '$1[REDACTED]$2');
}

export async function POST(req: Request) {
  if (env.NODE_ENV === 'production') {
    return new Response('Not allowed in production', { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('[SSE-DIAG-CLIENT]', redactAndTruncate(body));
  } catch {
    console.log('[SSE-DIAG-CLIENT] failed to parse body');
  }
  return new Response('ok', { status: 200 });
}

export async function GET(req: Request) {
  if (env.NODE_ENV === 'production') {
    return new Response('Not allowed in production', { status: 401 });
  }

  const msg = req.nextUrl.searchParams.get('msg');
  const truncated = msg && msg.length > 500 ? msg.substring(0, 500) + '...[truncated]' : msg;
  console.log('[SSE-DIAG-CLIENT]', truncated);
  return new Response('ok', { status: 200 });
}
