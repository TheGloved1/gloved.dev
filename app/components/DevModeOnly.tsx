import { checkDevMode } from '@/lib/utils'
import React from 'react'

type DevModeOnlyProps = {
  children: React.ReactNode
  fallback?: React.ReactNode | null
}

export default function DevModeOnly({ children, fallback }: DevModeOnlyProps): React.JSX.Element {
  const isDev = checkDevMode()
  return <>{isDev ? children : fallback}</>
}
