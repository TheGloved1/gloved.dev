import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getTop100 = query({
  handler: async (ctx) => {
    const entries = await ctx.db.query('leaderboardEntries').withIndex('by_score').order('desc').take(100);
    return entries;
  },
});

export const getUserBestScore = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const best = await ctx.db
      .query('leaderboardEntries')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .order('desc')
      .first();
    return best?.score ?? null;
  },
});

export const addEntry = mutation({
  args: {
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Authentication required');
    }
    const userId = identity.subject;
    const username = identity.nickname || identity.name || identity.email || 'Anonymous';

    const existing = await ctx.db
      .query('leaderboardEntries')
      .withIndex('by_userId', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      if (args.score > existing.score) {
        await ctx.db.patch(existing._id, {
          score: args.score,
          username: username,
          timestamp: Date.now(),
        });
      }
    } else {
      await ctx.db.insert('leaderboardEntries', {
        userId: userId,
        username: username,
        score: args.score,
        timestamp: Date.now(),
      });
    }
  },
});
