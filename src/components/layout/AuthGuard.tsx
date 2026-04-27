import type { ReactNode } from 'react'

interface AuthGuardProps {
  isAuthenticated: boolean
  children: ReactNode
  fallback?: ReactNode
}

export function AuthGuard({ isAuthenticated, children, fallback = null }: AuthGuardProps) {
  if (!isAuthenticated) return <>{fallback}</>
  return <>{children}</>
}
