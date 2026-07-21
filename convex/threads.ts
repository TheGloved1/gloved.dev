import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const threads = await ctx.db
      .query('threads')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(50);
    return threads.filter((t) => t.status !== 'deleted');
  },
});

export const getById = query({
  args: { id: v.id('threads') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('threads')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    userId: v.optional(v.string()),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('threads', {
      title: args.title,
      status: 'done',
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      userId: args.userId,
      externalId: args.externalId,
    });
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id('threads'),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { title: args.title, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id('threads') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: 'deleted', updatedAt: Date.now() });

    // Delete all messages in batches to handle threads with >500 messages
    let hasMore = true;
    while (hasMore) {
      const messages = await ctx.db
        .query('messages')
        .withIndex('by_threadId', (q) => q.eq('threadId', args.id))
        .take(500);

      if (messages.length === 0) {
        hasMore = false;
      } else {
        await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));
        hasMore = messages.length === 500;
      }
    }
  },
});
