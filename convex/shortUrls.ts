import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    // Also allow relative paths
    return url.startsWith('/');
  }
}

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
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }
    const userId = identity.subject;
    const entries = await ctx.db
      .query('shortUrls')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
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
    shortId: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }
    const userId = identity.subject;

    if (!isValidUrl(args.url)) {
      throw new Error('Invalid URL: Only http://, https://, or relative paths are allowed');
    }

    const existing = await ctx.db
      .query('shortUrls')
      .withIndex('by_shortId', (q) => q.eq('shortId', args.shortId))
      .first();
    if (existing) {
      if (existing.userId !== userId) {
        throw new Error('Unauthorized: You do not own this short URL');
      }
      await ctx.db.patch(existing._id, { url: args.url });
    } else {
      await ctx.db.insert('shortUrls', {
        shortId: args.shortId,
        url: args.url,
        userId: userId,
      });
    }
  },
});
