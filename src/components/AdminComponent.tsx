'use client';
import Loading from '@/components/loading';
import { getAdminsAction } from '@/lib/actions';
import { tryCatch } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';

export default function AdminComponent({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}): React.JSX.Element {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isErrored, setIsErrored] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const currentUserAsync = async () => {
      const { data: admins, error: getAdminsError } = await tryCatch(getAdminsAction());
      if (getAdminsError) {
        setIsErrored(true);
        setIsLoading(false);
        return;
      }
      if (!user?.primaryEmailAddress?.emailAddress) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      setIsAdmin(admins.includes(user.primaryEmailAddress.emailAddress));
      setIsLoading(false);
    };
    currentUserAsync();
  }, [user?.primaryEmailAddress?.emailAddress]);

  if (isErrored) {
    return <></>;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <></>;
}
