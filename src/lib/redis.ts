import { env } from '@/env';
import { Redis } from '@upstash/redis';

let client: Redis | null = null;

function getRedis(): Redis {
  if (!client) {
    client = new Redis({
      url: env.KV_REST_API_URL,
      token: env.KV_REST_API_TOKEN,
    });
  }
  return client;
}

class RedisClient {
  static get() {
    return getRedis();
  }
}

const redisClient = RedisClient.get();

const STREAM_PREFIX = 'chat:stream:';
const STREAM_TTL = 120;

export type StreamStatus = 'streaming' | 'done' | 'error';

export type StreamData = { content: string; reasoning?: string; status?: StreamStatus };

export async function setStreamContent(messageId: string, content: string, reasoning: string): Promise<void> {
  await redisClient.set(`${STREAM_PREFIX}${messageId}`, { content, reasoning, status: 'streaming' } satisfies StreamData, {
    ex: STREAM_TTL,
  });
}

export async function getStreamContent(messageId: string): Promise<StreamData | null> {
  return redisClient.get<StreamData | null>(`${STREAM_PREFIX}${messageId}`);
}

export async function deleteStreamContent(messageId: string): Promise<void> {
  await redisClient.del(`${STREAM_PREFIX}${messageId}`);
}

export async function publishStreamUpdate(messageId: string, content: string, reasoning: string): Promise<void> {
  await redisClient.publish(
    `${STREAM_PREFIX}${messageId}`,
    JSON.stringify({ content, reasoning, status: 'streaming' } satisfies StreamData),
  );
}

export async function publishStreamStatus(
  messageId: string,
  content: string,
  reasoning: string | undefined,
  status: StreamStatus,
): Promise<void> {
  const payload: StreamData = { content, status };
  if (reasoning !== undefined) payload.reasoning = reasoning;
  await redisClient.publish(`${STREAM_PREFIX}${messageId}`, JSON.stringify(payload));
}

export function getStreamChannel(messageId: string): string {
  return `${STREAM_PREFIX}${messageId}`;
}

export type StreamMessageHandler = (data: StreamData) => void;
export type StreamErrorHandler = (error: Error) => void;

export interface StreamSubscription {
  unsubscribe: () => Promise<void>;
}

export async function subscribeToStream(
  messageId: string,
  onMessage: StreamMessageHandler,
  onError?: StreamErrorHandler,
): Promise<StreamSubscription> {
  const channel = getStreamChannel(messageId);
  const sub = redisClient.subscribe([channel]);

  sub.on('message', (event: { channel: string; message: unknown }) => {
    const msg = event.message;
    if (typeof msg === 'object' && msg !== null) {
      onMessage(msg as StreamData);
    } else if (typeof msg === 'string') {
      try {
        onMessage(JSON.parse(msg) as StreamData);
      } catch {
        // skip malformed
      }
    }
  });

  if (onError) {
    sub.on('error', (err: Error) => onError(err));
  }

  return {
    unsubscribe: async () => {
      await sub.unsubscribe([channel]);
    },
  };
}
