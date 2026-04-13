import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Eye, Zap, Briefcase, Bell,
  BarChart2, Users, Download, ShieldCheck,
  ChevronLeft, ChevronRight, GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

/* ─── Navigation groups ──────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: null, /* no group heading — primary items */
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Market',
    items: [
      { to: '/watchlist', icon: Eye,        label: 'Watchlist' },
      { to: '/signals',   icon: Zap,        label: 'Signals' },
      { to: '/alerts',    icon: Bell,       label: 'Alerts' },
      { to: '/social',    icon: Users,      label: 'Social' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/portfolio',  icon: Briefcase,  label: 'Portfolio' },
      { to: '/strategies', icon: GitBranch,  label: 'Strategies' },
      { to: '/export',     icon: Download,   label: 'Export' },
    ],
  },
]

const ADMIN_ITEMS = [
  { to: '/admin', icon: ShieldCheck, label: 'Admin' },
]

/* ─── Single nav link ────────────────────────────────────── */
function NavItem({ item, collapsed }) {
  const { to, icon: Icon, label } = item

  const link = (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          'text-[--color-subtle] hover:text-[--color-primary-text] hover:bg-[--color-surface-low]',
          isActive && 'text-[--color-primary-text] bg-[--color-container]',
          collapsed && 'justify-center px-2'
        )
      }
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

/* ─── Sidebar ────────────────────────────────────────────── */
export default function Sidebar() {
  const { isAdmin }   = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      style={{ width: collapsed ? 'var(--sidebar-icon)' : 'var(--sidebar-full)' }}
      className="flex flex-col h-full bg-[--color-void] border-r border-[--color-surface-low] transition-all duration-200 shrink-0"
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-3 gap-2 shrink-0', collapsed && 'justify-center')}>
        <div className="w-7 h-7 rounded-md bg-[--color-action] flex items-center justify-center shrink-0">
          <BarChart2 size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-[--color-max-text] tracking-tight text-sm">
            CrowdSignal
          </span>
        )}
      </div>

      <Separator className="bg-[--color-surface-low]" />

      {/* Nav groups */}
      <nav className="flex-1 flex flex-col overflow-y-auto p-2 gap-4 mt-2">
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-1">
            {group.label && !collapsed && (
              <p className="px-3 text-[10px] font-semibold text-[--color-muted] uppercase tracking-wider mb-1">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </div>
        ))}

        {/* Admin section */}
        {isAdmin && (
          <div className="flex flex-col gap-1">
            <Separator className="bg-[--color-surface-low] mb-2" />
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold text-[--color-muted] uppercase tracking-wider mb-1">
                Admin
              </p>
            )}
            {ADMIN_ITEMS.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-[--color-surface-low] shrink-0">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            'flex items-center justify-center w-full rounded-lg p-2',
            'text-[--color-muted] hover:text-[--color-subtle] hover:bg-[--color-surface-low]',
            'transition-colors'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
