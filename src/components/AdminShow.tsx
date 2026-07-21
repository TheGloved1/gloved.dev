'use client';
import { useUser } from '@clerk/nextjs';
import React from 'react';

export default function AdminShow({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.isAdmin === true;
  console.log('isAdmin', isAdmin);

  if (isAdmin) return <>{children}</>;
  return <></>;
}
