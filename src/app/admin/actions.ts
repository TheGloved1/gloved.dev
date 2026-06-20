'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';

export async function getUsers(page: number = 1) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  if (!caller.publicMetadata?.isAdmin) throw new Error('Unauthorized');

  const limit = 50;
  const offset = (page - 1) * limit;
  const { data: result, totalCount } = await client.users.getUserList({ limit, offset });

  const users = result.map((u) => ({
    id: u.id,
    email: u.emailAddresses?.[0]?.emailAddress ?? '',
    username: u.username ?? u.firstName ?? u.emailAddresses?.[0]?.emailAddress ?? 'Unknown',
    imageUrl: u.imageUrl,
    isAdmin: u.publicMetadata?.isAdmin === true,
    isOwner: u.publicMetadata?.isOwner === true,
    createdAt: u.createdAt,
  }));

  return {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function toggleAdmin(userId: string, makeAdmin: boolean) {
  const { userId: callerId } = await auth();
  if (!callerId) throw new Error('Unauthenticated');

  const client = await clerkClient();
  const caller = await client.users.getUser(callerId);
  if (!caller.publicMetadata?.isAdmin) throw new Error('Unauthorized');

  if (userId === callerId) throw new Error('Cannot change own admin status');

  const target = await client.users.getUser(userId);
  if (target.publicMetadata?.isOwner) throw new Error('Cannot change owner status');

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...target.publicMetadata,
      isAdmin: makeAdmin,
    },
  });
}

export async function migrateLegacyAdmins(admins: { email: string; isOwner: boolean }[]) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const client = await clerkClient();
  const caller = await client.users.getUser(userId);
  if (!caller.publicMetadata?.isAdmin) throw new Error('Unauthorized');

  const results: { email: string; success: boolean; error?: string }[] = [];

  for (const admin of admins) {
    try {
      const { data: users } = await client.users.getUserList({
        emailAddress: [admin.email],
        limit: 1,
      });
      const user = users[0];
      if (!user) {
        results.push({ email: admin.email, success: false, error: 'User not found' });
        continue;
      }
      await client.users.updateUser(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          isAdmin: true,
          isOwner: admin.isOwner,
        },
      });
      results.push({ email: admin.email, success: true });
    } catch (err) {
      results.push({ email: admin.email, success: false, error: String(err) });
    }
  }

  return results;
}
