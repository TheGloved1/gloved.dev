import { getConvexClient } from '@/lib/convex-server';
import { getStreamContent, StreamData, StreamStatus, subscribeToStream } from '@/lib/redis';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { NextRequest } from 'next/server';

const SAFETY_TIMEOUT_MS = 60_000;
const KEEPALIVE_INTERVAL_MS = 30_000;

export async function GET(req: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;

  let content = '';
  let reasoning: string | undefined;
  let status: StreamStatus = 'streaming';

  const streamData = await getStreamContent(messageId);
  if (streamData) {
    content = streamData.content;
    reasoning = streamData.reasoning;
    if (streamData.status && streamData.status !== 'streaming') {
      status = streamData.status;
    }
  }

  if (!streamData || status === 'streaming') {
    try {
      const cvx = getConvexClient();
      const msg = await cvx.query(api.messages.getById, { id: messageId as Id<'messages'> });
      if (msg) {
        if (!streamData) {
          content = msg.content ?? '';
          reasoning = msg.reasoning ?? undefined;
        }
        if (msg.status !== 'streaming') {
          status = msg.status === 'error' ? 'error' : 'done';
          content = msg.content ?? content;
          reasoning = msg.reasoning ?? reasoning;
        }
      } else if (!streamData) {
        status = 'done';
      }
    } catch (e) {
      console.warn('[STREAM] Convex query failed', e);
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start: async (controller) => {
      const sendEvent = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Controller already closed
        }
      };

      sendEvent({ type: 'resume', content, reasoning, status });

      if (status !== 'streaming') {
        controller.close();
        return;
      }

      const keepalive = setInterval(() => sendEvent({ type: 'ping' }), KEEPALIVE_INTERVAL_MS);

      let finalized = false;
      let sub: { unsubscribe: () => Promise<void> } | null = null;
      let finalizeReason = '';

      const persistToConvex = async (
        finalStatus: StreamStatus,
        finalContent: string,
        finalReasoning: string | undefined,
      ) => {
        try {
          const cvx = getConvexClient();
          if (finalStatus === 'error') {
            await cvx.mutation(api.messages.setError, {
              id: messageId as Id<'messages'>,
              content: finalContent || 'Stream error',
            });
          } else {
            await cvx.mutation(api.messages.setDone, {
              id: messageId as Id<'messages'>,
              content: finalContent,
              reasoning: finalReasoning,
            });
          }
        } catch (e) {
          console.error('[STREAM] persistToConvex failed', e);
        }
      };

      const finalize = (finalStatus: StreamStatus, finalContent: string, finalReasoning: string | undefined) => {
        if (finalized) return;
        finalized = true;
        clearTimeout(safetyTimeout);
        clearInterval(keepalive);
        if (finalStatus === 'error') {
          sendEvent({ type: 'error', content: finalContent, reasoning: finalReasoning, error: 'Stream error' });
        } else {
          sendEvent({ type: 'done', content: finalContent, reasoning: finalReasoning });
        }
        sub?.unsubscribe().catch(() => {});
        controller.close();
        persistToConvex(finalStatus, finalContent, finalReasoning);
      };

      const safetyTimeout = setTimeout(() => {
        finalizeReason = 'safety-timeout-60s';
        finalize('done', content, reasoning);
      }, SAFETY_TIMEOUT_MS);

      try {
        sub = await subscribeToStream(
          messageId,
          (data: StreamData) => {
            if (data.content !== content || data.reasoning !== reasoning) {
              content = data.content;
              reasoning = data.reasoning;
              sendEvent({ type: 'update', content, reasoning, status: 'streaming' });
            }
            if (data.status && data.status !== 'streaming') {
              finalizeReason = 'pubsub-final-status';
              finalize(data.status as StreamStatus, data.content, data.reasoning);
            }
          },
          () => {
            finalizeReason = 'pubsub-error';
            finalize('done', content, reasoning);
          },
        );
      } catch (e) {
        console.warn('[STREAM] subscribeToStream failed', e);
        finalizeReason = 'subscribe-failed';
        finalize('done', content, reasoning);
      }

      req.signal.addEventListener('abort', () => {
        if (!finalized) {
          finalized = true;
          clearTimeout(safetyTimeout);
          clearInterval(keepalive);
          sub?.unsubscribe().catch(() => {});
          controller.close();
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
