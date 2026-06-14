'use client';
import { api } from '@convex/api';
import { useQuery } from 'convex/react';

export function useAdmin() {
  const isAdmin = useQuery(api.admins.isAdmin);
  const admins = useQuery(api.admins.list);

  return {
    isAdmin,
    data: admins ?? [],
  };
}
