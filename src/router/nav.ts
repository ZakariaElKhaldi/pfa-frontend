import type { IconName } from '@/components/design-system/icons'
import type { UserRole } from '@/components/design-system/RoleBadge'

export interface NavItem {
  id: string
  label: string
  path: string
  icon: IconName
  /** Minimum role required. Absent = any authenticated user. */
  minRole?: 'analyst' | 'admin'
  /** Group this item belongs to in the sidebar */
  group: 'main' | 'analyst' | 'admin' | 'system'
}

export const NAV_ITEMS: NavItem[] = [
  // ── All users ──────────────────────────────────────────────────
  { id: 'dashboard',  label: 'Dashboard',  path: '/',              icon: 'Grid',         group: 'main' },
  { id: 'tickers',    label: 'Market',     path: '/tickers',       icon: 'BarChart',     group: 'main' },
  { id: 'watchlist',  label: 'Watchlist',  path: '/watchlist',     icon: 'Star',         group: 'main' },
  { id: 'portfolio',  label: 'Portfolio',  path: '/portfolio',     icon: 'Briefcase',    group: 'main' },
  { id: 'alerts',     label: 'Alerts',     path: '/alerts',        icon: 'Bell',         group: 'main' },
  { id: 'strategies', label: 'Strategies', path: '/strategies',    icon: 'TrendingUp',   group: 'main' },
  { id: 'export',     label: 'Export',     path: '/export',        icon: 'Download',     group: 'main' },

  // ── Analyst + Admin ────────────────────────────────────────────
  { id: 'analytics',     label: 'Analytics',    path: '/analytics',    icon: 'LineChart',    group: 'analyst', minRole: 'analyst' },
  { id: 'intelligence',  label: 'Intelligence', path: '/intelligence', icon: 'Bot',          group: 'analyst', minRole: 'analyst' },
  { id: 'audit',         label: 'Audit',        path: '/audit',        icon: 'FileText',     group: 'analyst', minRole: 'analyst' },

  // ── Admin only ─────────────────────────────────────────────────
  { id: 'admin',       label: 'Admin',      path: '/admin',         icon: 'ShieldCheck',  group: 'admin', minRole: 'admin' },
  { id: 'admin-users', label: 'Users',      path: '/admin/users',   icon: 'Users',        group: 'admin', minRole: 'admin' },

  // ── System ─────────────────────────────────────────────────────
  { id: 'profile', label: 'Profile', path: '/profile', icon: 'User', group: 'system' },
]

export function visibleNav(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => {
    if (!item.minRole) return true
    if (item.minRole === 'analyst') return role === 'analyst' || role === 'admin'
    if (item.minRole === 'admin')   return role === 'admin'
    return false
  })
}

/** Map a pathname to a nav item id (exact + prefix match). */
export function pathToNavId(pathname: string): string {
  const sorted = [...NAV_ITEMS].sort((a, b) => b.path.length - a.path.length)
  const match = sorted.find(item =>
    item.path === '/'
      ? pathname === '/'
      : pathname === item.path || pathname.startsWith(item.path + '/'),
  )
  return match?.id ?? 'dashboard'
}
