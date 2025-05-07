'use client';
import Loading from '@/components/loading';
import { useAdmin } from '@/hooks/use-admin';
import React from 'react';

export default function AdminComponent({
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
