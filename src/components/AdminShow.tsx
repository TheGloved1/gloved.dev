'use client';
import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';
import React from 'react';

/**
 * Simple component that only renders its children if the user is an admin.
 * @param children The children to render if the user is an admin.
 * @param fallback The fallback element to render if the user is not an admin.
 */
export default function AdminShow({ children }: { children: React.ReactNode }): React.JSX.Element {
  const isAdmin = useQuery(api.admins.isAdmin);
  console.log('isAdmin', isAdmin);

  if (isAdmin) {
    return <>{children}</>;
  }

  return <></>;
}
