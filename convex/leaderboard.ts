import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getTop100 = query({
  args: {},
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
    userId: v.string(),
    username: v.string(),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('leaderboardEntries')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .first();

    if (existing) {
      if (args.score > existing.score) {
        await ctx.db.patch(existing._id, {
          score: args.score,
          username: args.username,
          timestamp: Date.now(),
        });
      }
    } else {
      await ctx.db.insert('leaderboardEntries', {
        userId: args.userId,
        username: args.username,
        score: args.score,
        timestamp: Date.now(),
      });
    }
  },
});
