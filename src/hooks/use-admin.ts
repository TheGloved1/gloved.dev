'use client';
import { useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import { useQuery } from 'convex/react';

export function useAdmin() {
  const { user } = useUser();
  const admins = useQuery(api.admins.list);

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress ? (admins ?? []).includes(user.primaryEmailAddress.emailAddress) : false;

  return {
    isAdmin,
    data: admins ?? [],
    isLoading: admins === undefined,
    error: null,
  };
}
