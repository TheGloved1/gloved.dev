import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getById = query({
  args: { shortId: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query('shortUrls')
      .withIndex('by_shortId', (q) => q.eq('shortId', args.shortId))
      .first();
    return entry?.url ?? null;
  },
});

export const getByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query('shortUrls')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .take(100);
    const result: Record<string, string> = {};
    for (const entry of entries) {
      result[entry.shortId] = entry.url;
    }
    return result;
  },
});

export const set = mutation({
  args: {
    userId: v.string(),
    shortId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('shortUrls')
      .withIndex('by_shortId', (q) => q.eq('shortId', args.shortId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { url: args.url });
    } else {
      await ctx.db.insert('shortUrls', {
        shortId: args.shortId,
        url: args.url,
        userId: args.userId,
      });
    }
  },
});
