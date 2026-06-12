'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const ChatSidebar = dynamic(() => import('./ChatSidebar'), { ssr: false });

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ChatSidebar>{children}</ChatSidebar>
    </Suspense>
  );
}
