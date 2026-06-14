'use client';

import { ReactNode } from 'react';
import { useTransition } from '../layout';

export function TransitionLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const { navigate } = useTransition();

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
