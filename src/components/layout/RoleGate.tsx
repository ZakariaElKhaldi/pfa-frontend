import type { ReactNode } from 'react'
import type { UserRole } from '@/components/design-system/RoleBadge'

type RoleRequirement = UserRole | 'analyst+admin'

interface RoleGateProps {
  role: UserRole
  require: RoleRequirement
  children: ReactNode
  fallback?: ReactNode
}

function hasAccess(userRole: UserRole, require: RoleRequirement): boolean {
  if (require === 'analyst+admin') return userRole === 'analyst' || userRole === 'admin'
  if (require === 'admin') return userRole === 'admin'
  if (require === 'analyst') return userRole === 'analyst' || userRole === 'admin'
  return true
}

export function RoleGate({ role, require, children, fallback = null }: RoleGateProps) {
  if (!hasAccess(role, require)) return <>{fallback}</>
  return <>{children}</>
}
