import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[SSE-DIAG-CLIENT]', JSON.stringify(body));
  } catch {
    console.log('[SSE-DIAG-CLIENT] failed to parse body');
  }
  return new Response('ok', { status: 200 });
}

export async function GET(req: NextRequest) {
  const msg = req.nextUrl.searchParams.get('msg');
  console.log('[SSE-DIAG-CLIENT]', msg);
  return new Response('ok', { status: 200 });
}
