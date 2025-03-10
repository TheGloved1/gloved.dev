'use client';
import { cn } from '@/lib/utils';
import { Link } from 'next-view-transitions';
import { LinkProps } from 'next/link';
import { ComponentPropsWithoutRef } from 'react';

type CustomButtonProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
} & ComponentPropsWithoutRef<'button'>;

type CustomLinkProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  targetAndRel?: boolean;
} & LinkProps;

function getClassName(
  className: string | undefined,
  Default: string = 'btn m-2 rounded-xl p-4 hover:animate-pulse hover:bg-gray-700',
): string {
  return cn(Default, className);
}

export default function DefaultButton({ children, className, ...props }: CustomButtonProps): React.JSX.Element {
  return (
    <button className={getClassName(className)} {...props}>
      {children}
    </button>
  );
}

export function RedButton({ children, className, ...props }: CustomButtonProps): React.JSX.Element {
  return (
    <button
      className={getClassName(className, 'btn btn-square btn-warning rounded-xl bg-red-500 hover:bg-red-400')}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, className, ...props }: CustomButtonProps): React.JSX.Element {
  return (
    <button className={getClassName(className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({ children, className, targetAndRel, ...props }: CustomLinkProps): React.JSX.Element {
  return (
    <Link
      className={getClassName(className)}
      target={targetAndRel ? '_blank' : undefined}
      rel={targetAndRel ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}
