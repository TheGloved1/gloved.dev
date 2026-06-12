import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  threads: defineTable({
    title: v.string(),
    status: v.union(v.literal('streaming'), v.literal('done'), v.literal('deleted')),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastMessageAt: v.number(),
    userId: v.optional(v.string()),
    externalId: v.optional(v.string()),
  })
    .index('by_userId', ['userId'])
    .index('by_externalId', ['externalId']),

  messages: defineTable({
    threadId: v.id('threads'),
    content: v.string(),
    role: v.union(v.literal('user'), v.literal('assistant')),
    model: v.string(),
    status: v.union(v.literal('streaming'), v.literal('done'), v.literal('error'), v.literal('deleted')),
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
    attachments: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.string()),
    externalId: v.optional(v.string()),
  })
    .index('by_threadId', ['threadId'])
    .index('by_userId', ['userId'])
    .index('by_externalId', ['externalId']),

  admins: defineTable({
    email: v.string(),
  }).index('by_email', ['email']),

  groceryItems: defineTable({
    text: v.string(),
    listKey: v.union(v.literal('shopping-list'), v.literal('have-list')),
    addedAt: v.number(),
    updatedAt: v.optional(v.number()),
    addedBy: v.string(),
  }).index('by_listKey', ['listKey']),

  leaderboardEntries: defineTable({
    userId: v.string(),
    username: v.string(),
    score: v.number(),
    timestamp: v.number(),
  })
    .index('by_score', ['score'])
    .index('by_userId', ['userId']),

  shortUrls: defineTable({
    shortId: v.string(),
    url: v.string(),
    userId: v.string(),
  })
    .index('by_shortId', ['shortId'])
    .index('by_userId', ['userId']),
});
