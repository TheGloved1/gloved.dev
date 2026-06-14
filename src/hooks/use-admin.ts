'use client';
import { api } from '@convex/api';
import { useQuery } from 'convex/react';

export function useAdmin() {
  const isAdmin = useQuery(api.admins.isAdmin);
  const admins = useQuery(api.admins.list);
  console.log('useAdmin', { isAdmin, admins });

  return {
    isAdmin,
    data: admins ?? [],
    isLoading: admins === undefined,
    error: null,
  };
}
