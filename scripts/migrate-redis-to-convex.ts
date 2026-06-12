#!/usr/bin/env tsx
import { Redis } from '@upstash/redis';
import { ConvexHttpClient } from 'convex/browser';
import { makeFunctionReference } from 'convex/server';
import { config } from 'dotenv';

config({ path: ['.env', '.env.local'] });

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!KV_URL || !KV_TOKEN || !CONVEX_URL) {
  console.error('Missing required env vars: KV_REST_API_URL, KV_REST_API_TOKEN, NEXT_PUBLIC_CONVEX_URL');
  process.exit(1);
}

const redis = new Redis({ url: KV_URL, token: KV_TOKEN });
const convex = new ConvexHttpClient(CONVEX_URL);

const mutations = {
  admins: {
    add: makeFunctionReference<'mutation'>('admins:add'),
  },
  groceries: {
    addItem: makeFunctionReference<'mutation'>('groceries:addItem'),
  },
  leaderboard: {
    addEntry: makeFunctionReference<'mutation'>('leaderboard:addEntry'),
  },
  shortUrls: {
    set: makeFunctionReference<'mutation'>('shortUrls:set'),
  },
  threads: {
    create: makeFunctionReference<'mutation'>('threads:create'),
  },
  messages: {
    create: makeFunctionReference<'mutation'>('messages:create'),
  },
} as const;

let added = 0;
let errors = 0;

async function batch<T>(items: T[], fn: (item: T) => Promise<void>, concurrency = 10, label = '') {
  let done = 0;
  const total = items.length;
  const next = async (i: number) => {
    if (i >= total) return;
    await fn(items[i]);
    done++;
    if (label && (done % Math.max(1, Math.floor(total / 10)) === 0 || done === total)) {
      console.log(`  ${label}: ${done}/${total}`);
    }
    await next(i + concurrency);
  };
  const workers = Array.from({ length: Math.min(concurrency, total) }, (_, i) => next(i));
  await Promise.all(workers);
}

async function migrateAdmins() {
  const admins = await redis.get<string[]>('admins');
  if (!admins?.length) return;
  console.log(`\n--- Admins (${admins.length}) ---`);
  await batch(
    admins,
    async (email) => {
      await convex.mutation(mutations.admins.add, { email });
      added++;
    },
    10,
    'Admins',
  );
}

async function migrateGroceries() {
  for (const listKey of ['shopping-list', 'have-list'] as const) {
    const items = await redis.get<any[]>(`groceries:${listKey}`);
    if (!items?.length) continue;
    console.log(`\n--- Groceries:${listKey} (${items.length}) ---`);
    await batch(
      items,
      async (item) => {
        const text = typeof item === 'string' ? item : item?.text || '';
        if (!text) return;
        await convex.mutation(mutations.groceries.addItem, {
          listKey,
          text,
          addedBy: (typeof item === 'object' && item?.addedBy) || 'migration',
        });
        added++;
      },
      10,
      `Groceries:${listKey}`,
    );
  }
}

async function migrateLeaderboard() {
  const entries = await redis.get<any[]>('kirk-bird:leaderboard');
  if (!entries?.length) return;
  console.log(`\n--- Leaderboard (${entries.length}) ---`);
  await batch(
    entries,
    async (entry) => {
      await convex.mutation(mutations.leaderboard.addEntry, {
        userId: entry.userId,
        username: entry.username,
        score: entry.score,
      });
      added++;
    },
    10,
    'Leaderboard',
  );
}

async function migrateShortUrls() {
  const data = await redis.get<Record<string, Record<string, string>>>('shortenedUrls');
  if (!data) return;
  const entries: { userId: string; shortId: string; url: string }[] = [];
  for (const [userId, urls] of Object.entries(data)) {
    for (const [shortId, url] of Object.entries(urls)) {
      entries.push({ userId, shortId, url });
    }
  }
  if (!entries.length) return;
  console.log(`\n--- Short URLs (${entries.length}) ---`);
  await batch(
    entries,
    async (entry) => {
      await convex.mutation(mutations.shortUrls.set, entry);
      added++;
    },
    10,
    'Short URLs',
  );
}

async function migrateChatData() {
  const threadKeys = await redis.keys('sync:thread:*');
  const userThreads = new Map<string, string[]>();
  for (const key of threadKeys) {
    const userId = key.split(':')[2];
    if (!userId) continue;
    if (!userThreads.has(userId)) userThreads.set(userId, []);
    userThreads.get(userId)!.push(key);
  }

  const msgKeys = await redis.keys('sync:msg:*');
  const userMessages = new Map<string, string[]>();
  for (const key of msgKeys) {
    const userId = key.split(':')[2];
    if (!userId) continue;
    if (!userMessages.has(userId)) userMessages.set(userId, []);
    userMessages.get(userId)!.push(key);
  }

  let totalThreads = 0;
  let totalMessages = 0;

  for (const [userId, tKeys] of userThreads) {
    console.log(`\n--- Chat: ${userId} ---`);
    const threads = (await redis.mget<any[]>(...tKeys)).filter(Boolean);
    totalThreads += threads.length;

    const mKeys = userMessages.get(userId) ?? [];
    const messages = mKeys.length ? (await redis.mget<any[]>(...mKeys)).filter(Boolean) : [];
    totalMessages += messages.length;

    const convexThreadIds = new Map<string, string>();

    await batch(
      threads,
      async (thread) => {
        if (!thread?.id) return;
        const id = await convex.mutation(mutations.threads.create, {
          title: thread.title || 'Migrated Chat',
          userId,
          externalId: thread.id,
        });
        convexThreadIds.set(thread.id, String(id));
        added++;
      },
      5,
      `Threads (${userId})`,
    );

    await batch(
      messages,
      async (msg) => {
        if (!msg?.threadId || !msg.id) return;
        const convexThreadId = convexThreadIds.get(msg.threadId);
        if (!convexThreadId) {
          errors++;
          return;
        }
        await convex.mutation(mutations.messages.create, {
          threadId: convexThreadId,
          content: msg.content ?? '',
          role: msg.role ?? 'user',
          model: msg.model ?? 'unknown',
          userId,
          attachments: msg.attachments?.length ? msg.attachments : undefined,
          externalId: msg.id,
        });
        added++;
      },
      5,
      `Messages (${userId})`,
    );
  }

  console.log(`\nChat summary: ${totalThreads} threads, ${totalMessages} messages`);
}

async function main() {
  console.log('=== Redis -> Convex Migration ===\n');
  await migrateAdmins();
  await migrateGroceries();
  await migrateLeaderboard();
  await migrateShortUrls();
  await migrateChatData();
  console.log(`\n=== Done: ${added} added, ${errors} errors ===`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
