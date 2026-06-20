let _isAdmin = false;

export function setDebugAdmin(v: boolean) {
  _isAdmin = v;
}

export function debugLog(...args: unknown[]) {
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev && !_isAdmin) return;

  console.log(...args);

  if (isDev && typeof window !== 'undefined') {
    fetch('/api/chat/debug', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args, t: Date.now() }),
    }).catch(() => {});
  }
}

export function diagLog(tag: string, data: Record<string, unknown>) {
  debugLog('[SSE-DIAG]', { tag, ...data });
}
