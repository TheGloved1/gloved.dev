'use client';
import { useUser } from '@clerk/nextjs';

export function useAdmin() {
  const { user } = useUser();
  return {
    isAdmin: user?.publicMetadata?.isAdmin === true,
  };
}
