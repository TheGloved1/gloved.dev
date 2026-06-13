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
    console.log('Listing admins...');
    const identity = await ctx.auth.getUserIdentity();
    console.log('User identity:', JSON.stringify(identity));
    const email = identity?.email;
    if (!email) return console.log('No email found in identity');
    const admin = await ctx.db
      .query('admins')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first();
    if (!admin) return [];
    const admins = await ctx.db.query('admins').collect();
    return admins.map((a) => a.email);
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
