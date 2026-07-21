import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getShoppingList = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('groceryItems')
      .withIndex('by_listKey', (q) => q.eq('listKey', 'shopping-list'))
      .collect();
  },
});

export const getHaveList = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('groceryItems')
      .withIndex('by_listKey', (q) => q.eq('listKey', 'have-list'))
      .collect();
  },
});

export const addItem = mutation({
  args: {
    listKey: v.union(v.literal('shopping-list'), v.literal('have-list')),
    text: v.string(),
    addedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('groceryItems', {
      text: args.text,
      listKey: args.listKey,
      addedAt: Date.now(),
      addedBy: args.addedBy,
    });
  },
});

export const removeItem = mutation({
  args: {
    itemId: v.id('groceryItems'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

export const moveItem = mutation({
  args: {
    fromListKey: v.union(v.literal('shopping-list'), v.literal('have-list')),
    toListKey: v.union(v.literal('shopping-list'), v.literal('have-list')),
    itemId: v.id('groceryItems'),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return;
    await ctx.db.patch(args.itemId, {
      listKey: args.toListKey,
      updatedAt: Date.now(),
    });
  },
});

export const bulkRemove = mutation({
  args: {
    itemIds: v.array(v.id('groceryItems')),
  },
  handler: async (ctx, args) => {
    await Promise.all(args.itemIds.map((id) => ctx.db.delete(id)));
  },
});

export const bulkMove = mutation({
  args: {
    fromListKey: v.union(v.literal('shopping-list'), v.literal('have-list')),
    toListKey: v.union(v.literal('shopping-list'), v.literal('have-list')),
    itemIds: v.array(v.id('groceryItems')),
  },
  handler: async (ctx, args) => {
    await Promise.all(args.itemIds.map((id) => ctx.db.patch(id, { listKey: args.toListKey, updatedAt: Date.now() })));
  },
});
