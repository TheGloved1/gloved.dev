import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getByThread = query({
  args: { threadId: v.id('threads') },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', args.threadId))
      .order('asc')
      .take(500);
    return messages.filter((m) => m.status !== 'deleted');
  },
});

export const getById = query({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    threadId: v.id('threads'),
    content: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    model: v.string(),
    userId: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
    externalId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('messages', {
      threadId: args.threadId,
      content: args.content,
      role: args.role,
      model: args.model,
      status: 'streaming',
      createdAt: now,
      updatedAt: now,
      userId: args.userId,
      attachments: args.attachments,
      externalId: args.externalId,
    });
  },
});

export const createPair = mutation({
  args: {
    threadId: v.id('threads'),
    userContent: v.string(),
    userRole: v.union(v.literal('user'), v.literal('assistant')),
    model: v.string(),
    userId: v.optional(v.string()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    console.log('[CHAT-DEBUG-CONVEX] createPair started', {
      threadId: args.threadId,
      role: args.userRole,
      model: args.model,
    });
    const now = Date.now();
    const userId = args.userId;
    await ctx.db.insert('messages', {
      threadId: args.threadId,
      content: args.userContent,
      role: args.userRole,
      model: args.model,
      status: 'done',
      createdAt: now,
      updatedAt: now,
      userId,
      attachments: args.attachments,
    });
    const assistantId = await ctx.db.insert('messages', {
      threadId: args.threadId,
      content: '',
      role: 'assistant',
      model: args.model,
      status: 'streaming',
      createdAt: now + 1,
      updatedAt: now + 1,
      userId,
    });
    console.log('[CHAT-DEBUG-CONVEX] createPair done', { assistantId });
    return { assistantId };
  },
});

export const getByExternalId = query({
  args: { externalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first();
  },
});

export const updateContent = mutation({
  args: {
    id: v.id('messages'),
    content: v.string(),
    status: v.optional(v.union(v.literal('streaming'), v.literal('done'), v.literal('error'))),
    reasoning: v.optional(v.string()),
    tools: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          status: v.union(v.literal('running'), v.literal('done'), v.literal('error')),
          after: v.number(),
          result: v.optional(v.any()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    console.log('[CHAT-DEBUG-CONVEX] updateContent', { id: args.id, contentLen: args.content.length, status: args.status });
    const patch: Record<string, unknown> = {
      content: args.content,
      updatedAt: Date.now(),
    };
    if (args.status) patch.status = args.status;
    if (args.reasoning !== undefined) patch.reasoning = args.reasoning;
    if (args.tools !== undefined) patch.tools = args.tools;
    await ctx.db.patch(args.id, patch);
  },
});

export const setDone = mutation({
  args: {
    id: v.id('messages'),
    content: v.string(),
    reasoning: v.optional(v.string()),
    tools: v.optional(
      v.array(
        v.object({
          id: v.string(),
          name: v.string(),
          status: v.union(v.literal('running'), v.literal('done'), v.literal('error')),
          after: v.number(),
          result: v.optional(v.any()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    console.log('[CHAT-DEBUG-CONVEX] setDone', { id: args.id, contentLen: args.content.length });
    await ctx.db.patch(args.id, {
      content: args.content,
      status: 'done',
      reasoning: args.reasoning,
      tools: args.tools,
      updatedAt: Date.now(),
    });
  },
});

export const editMessage = mutation({
  args: {
    userMessageId: v.id('messages'),
    threadId: v.id('threads'),
    newContent: v.string(),
    model: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userMsg = await ctx.db.get(args.userMessageId);
    if (!userMsg) throw new Error('User message not found');

    await ctx.db.patch(args.userMessageId, {
      content: args.newContent,
      updatedAt: Date.now(),
    });

    const msgs = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', args.threadId))
      .order('asc')
      .take(500);

    let found = false;
    for (const msg of msgs) {
      if (msg._id === args.userMessageId) {
        found = true;
        continue;
      }
      if (found && msg.status !== 'deleted') {
        await ctx.db.patch(msg._id, { status: 'deleted', updatedAt: Date.now() });
      }
    }

    const assistantId = await ctx.db.insert('messages', {
      threadId: userMsg.threadId,
      content: '',
      role: 'assistant',
      model: args.model,
      status: 'streaming',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: args.userId,
    });

    return { assistantId };
  },
});

export const setError = mutation({
  args: {
    id: v.id('messages'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      content: args.content,
      status: 'error',
      updatedAt: Date.now(),
    });
  },
});
