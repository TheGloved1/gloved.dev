import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

async function verifyThreadAccess(ctx: any, threadId: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('Authentication required');
  }
  const thread = await ctx.db.get(threadId);
  if (!thread) {
    throw new Error('Thread not found');
  }
  if (thread.userId !== identity.subject) {
    throw new Error('Unauthorized: You do not have access to this thread');
  }
  return identity;
}

export const getByThread = query({
  args: { threadId: v.id('threads') },
  handler: async (ctx, args) => {
    await verifyThreadAccess(ctx, args.threadId);
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
    const message = await ctx.db.get(args.id);
    if (message) {
      await verifyThreadAccess(ctx, message.threadId);
    }
    return message;
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
    const identity = await verifyThreadAccess(ctx, args.threadId);
    const now = Date.now();
    return await ctx.db.insert('messages', {
      threadId: args.threadId,
      content: args.content,
      role: args.role,
      model: args.model,
      status: 'streaming',
      createdAt: now,
      updatedAt: now,
      userId: identity.subject,
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
    const identity = await verifyThreadAccess(ctx, args.threadId);
    const now = Date.now();
    const userId = identity.subject;
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
    const message = await ctx.db
      .query('messages')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.externalId))
      .first();
    if (message) {
      await verifyThreadAccess(ctx, message.threadId);
    }
    return message;
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
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error('Message not found');
    }
    await verifyThreadAccess(ctx, message.threadId);
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
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error('Message not found');
    }
    await verifyThreadAccess(ctx, message.threadId);
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
    const identity = await verifyThreadAccess(ctx, args.threadId);
    const userMsg = await ctx.db.get(args.userMessageId);
    if (!userMsg) throw new Error('User message not found');

    await ctx.db.patch(args.userMessageId, {
      content: args.newContent,
      updatedAt: Date.now(),
    });

    // Process all messages after the edited one in batches
    let found = false;
    let hasMore = true;
    let lastCreatedAt = userMsg.createdAt;

    while (hasMore) {
      const msgs = await ctx.db
        .query('messages')
        .withIndex('by_threadId', (q) => q.eq('threadId', args.threadId))
        .order('asc')
        .filter((q) => q.gte(q.field('createdAt'), lastCreatedAt))
        .take(500);

      if (msgs.length === 0) break;

      for (const msg of msgs) {
        if (msg._id === args.userMessageId) {
          found = true;
          continue;
        }
        if (found && msg.status !== 'deleted') {
          await ctx.db.patch(msg._id, { status: 'deleted', updatedAt: Date.now() });
        }
        lastCreatedAt = msg.createdAt;
      }

      hasMore = msgs.length === 500;
    }

    const assistantId = await ctx.db.insert('messages', {
      threadId: userMsg.threadId,
      content: '',
      role: 'assistant',
      model: args.model,
      status: 'streaming',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: identity.subject,
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
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error('Message not found');
    }
    await verifyThreadAccess(ctx, message.threadId);
    await ctx.db.patch(args.id, {
      content: args.content,
      status: 'error',
      updatedAt: Date.now(),
    });
  },
});
