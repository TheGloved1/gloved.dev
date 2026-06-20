import { createClerkClient } from '@clerk/backend';
import 'dotenv/config';

const secretKey = process.env.CLERK_SECRET_KEY;
if (!secretKey) {
  console.error('CLERK_SECRET_KEY not found in environment');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey });

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/migrate-super-admin.mjs <email> [email...]');
  process.exit(1);
}

async function main() {
  for (const email of args) {
    try {
      const { data: users } = await clerk.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });
      const user = users[0];
      if (!user) {
        console.log(`User not found: ${email}`);
        continue;
      }

      const isOwner = email === 'gloves1229@gmail.com';
      await clerk.users.updateUser(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          isAdmin: true,
          isOwner,
        },
      });
      console.log(`OK  ${email} -> admin: true, owner: ${isOwner} (${user.id})`);
    } catch (err) {
      console.error(`ERR ${email}: ${err.message}`);
    }
  }
}

main().catch(console.error);
