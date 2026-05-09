import { Link, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/motion'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/design-system'
import { pathToNavId, visibleNav, type NavItem } from '@/router/nav'
import type { UserRole } from '@/components/design-system/RoleBadge'
import { useAuth } from '@/context/AuthContext'

interface AppSidebarProps {
  username?: string
  role?: UserRole
  /** Storybook/test override: controlled active id (skips useLocation) */
  activeId?: string
  /** Storybook/test override: click handler (skips Link navigation) */
  onSelect?: (id: string) => void
}

const GROUP_LABELS: Record<NavItem['group'], string> = {
  main:    'Navigate',
  analyst: 'Intelligence',
  admin:   'Administration',
  system:  'Account',
}

export function AppSidebar({ username = 'User', role = 'user', activeId, onSelect }: AppSidebarProps) {
  const location = useLocation()
  const { logout } = useAuth()
  const currentId = activeId ?? pathToNavId(location.pathname)

  const initials = username.slice(0, 2).toUpperCase()
  const items = visibleNav(role)

  const groups = (['main', 'analyst', 'admin', 'system'] as NavItem['group'][])
    .map(g => ({ group: g, items: items.filter(i => i.group === g) }))
    .filter(g => g.items.length > 0)

  function renderItem(item: NavItem) {
    const Icon = Icons[item.icon]
    const isActive = currentId === item.id

    const button = onSelect ? (
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        onClick={() => onSelect(item.id)}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </SidebarMenuButton>
    ) : (
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.label}
        render={<Link to={item.path} />}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </SidebarMenuButton>
    )

    return <SidebarMenuItem key={item.id}>{button}</SidebarMenuItem>
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] shadow-sm"
            style={{ background: 'hsl(220, 22%, 16%)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Icons.LineChart size={16} color="white" strokeWidth={2} />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div
              className="text-lg font-bold leading-tight truncate"
              style={{ color: 'var(--on-surface)', letterSpacing: 'var(--tracking-headline)' }}
            >
              CrowdSignal
            </div>
            <div
              className="mt-px font-mono text-xs truncate"
              style={{ color: 'var(--on-surface-muted)' }}
            >
              Sentient Terminal
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          {groups.map(({ group, items: groupItems }) => (
            <motion.div key={group} variants={staggerItem}>
              <SidebarGroup>
                <SidebarGroupLabel>{GROUP_LABELS[group]}</SidebarGroupLabel>
                <SidebarMenu>{groupItems.map(renderItem)}</SidebarMenu>
              </SidebarGroup>
            </motion.div>
          ))}
        </motion.div>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer hover:bg-accent hover:text-accent-foreground items-center gap-3 px-1 py-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center rounded-md transition-colors">
              <div className="avatar avatar-sm shrink-0" aria-label={`User: ${initials}`}>
                {initials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
                <span className="text-title-md truncate">{username}</span>
                <span className="text-body-sm capitalize truncate" style={{ fontSize: 'var(--text-label-sm)', color: 'var(--on-surface-muted)' }}>{role}</span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
