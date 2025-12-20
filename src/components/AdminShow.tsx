'use client';
import Loading from '@/components/loading';
import { useAdmin } from '@/hooks/use-admin';
import React from 'react';

/**
 * Simple component that only renders its children if the user is an admin.
 * @param children The children to render if the user is an admin.
 * @param fallback The fallback element to render if the user is not an admin.
 */
export default function AdminShow({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.JSX.Element {
  const admins = useAdmin();

  if (admins.error) {
    return <></>;
  }

  if (admins.isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Loading />;
  }

  if (admins.isAdmin) {
    return <>{children}</>;
  }

  return <></>;
}
