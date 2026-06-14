import { query } from './_generated/server';

export const identity = query({
  handler: async (ctx) => {
    return ctx.auth.getUserIdentity();
  },
});
