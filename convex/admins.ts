import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const admins = await ctx.db.query('admins').collect();
    return admins.map((a) => a.email);
  },
});

export const add = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('admins')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    if (!existing) {
      await ctx.db.insert('admins', { email: args.email });
    }
  },
});

export const remove = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (args.email === 'gloves1229@gmail.com') return null;
    const existing = await ctx.db
      .query('admins')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return 'success' as const;
    }
    return null;
  },
});
