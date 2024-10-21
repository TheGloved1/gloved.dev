import { cn } from '@/lib/utils'
import { ComponentPropsWithoutRef } from 'react'
import { Link } from '@remix-run/react'
import { RemixLinkProps } from '@remix-run/react/dist/components'

type CustomButtonProps = {
  children: React.ReactNode
  id?: string
  className?: string
} & ComponentPropsWithoutRef<'button'>

type CustomLinkProps = {
  children: React.ReactNode
  id?: string
  className?: string
} & RemixLinkProps

function getClassName(className: string | undefined, Default: string = 'btn m-2 rounded-xl p-4 hover:animate-pulse hover:bg-gray-700'): string {
  return cn(Default, className)
}

export default function DefaultButton({ children, className, ...props }: CustomButtonProps): React.JSX.Element {
  return (
    <button className={getClassName(className)} {...props}>
      {children}
    </button>
  )
}

export function SecondaryButton({ children, className, ...props }: CustomButtonProps): React.JSX.Element {
  return (
    <button className={getClassName(className)} {...props}>
      {children}
    </button>
  )
}

export function LinkButton({ children, className, ...props }: CustomLinkProps): React.JSX.Element {
  return (
    <Link className={getClassName(className)} {...props}>
      {children}
    </Link>
  )
}
