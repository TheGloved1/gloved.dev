import { v } from 'convex/values';
import { mutation, query, QueryCtx } from './_generated/server';

async function requireAdmin(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Unauthorized: Authentication required');
  }
  const email = identity.email;
  if (!email) {
    throw new Error('Unauthorized: Email not found in identity');
  }
  const admin = await ctx.db
    .query('admins')
    .withIndex('by_email', (q) => q.eq('email', email))
    .first();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
  return email;
}

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (!email) return [];
    const admin = await ctx.db
      .query('admins')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
    if (!admin) return [];
    const admins = await ctx.db.query('admins').collect();
    return admins.map((a) => a.email);
  },
});

export const isAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (!email) return false;
    const admin = await ctx.db
      .query('admins')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
    if (!admin) return false;
    const admins = await ctx.db.query('admins').collect();
    return admins.map((a) => a.email).includes(email);
  },
});

export const add = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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
