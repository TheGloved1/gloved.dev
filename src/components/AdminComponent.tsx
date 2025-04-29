'use client';
import Loading from '@/components/loading';
import { getAdminsAction } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

export default function AdminComponent({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.JSX.Element {
  const { user } = useUser();
  const adminsQuery = useQuery({
    queryKey: ['admins'],
    queryFn: getAdminsAction,
    enabled: !!user?.primaryEmailAddress?.emailAddress,
    initialData: [],
  });

  if (adminsQuery.error) {
    return <></>;
  }

  if (adminsQuery.isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Loading />;
  }

  if (!user?.primaryEmailAddress?.emailAddress) {
    return <></>;
  }

  if (adminsQuery.data.includes(user.primaryEmailAddress.emailAddress)) {
    return <>{children}</>;
  }

  return <></>;
}
