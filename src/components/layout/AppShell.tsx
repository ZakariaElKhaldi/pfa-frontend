import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Topbar } from './Topbar'
import type { TopbarProps } from './Topbar'
import type { UserRole } from '@/components/design-system/RoleBadge'
import type { WSStatus } from '@/components/common/WSStatusDot'

interface AppShellProps {
  children: ReactNode
  username?: string
  role?: UserRole
  defaultOpen?: boolean
  wsStatus?: WSStatus
  /** Optional breadcrumb items passed to Topbar */
  breadcrumb?: TopbarProps['breadcrumb']
  /** Optional search/command-palette slot passed to Topbar */
  searchSlot?: ReactNode
  /** Storybook/test: controlled active id passed through to AppSidebar */
  activeId?: string
  /** Storybook/test: nav click handler passed through to AppSidebar */
  onSelect?: (id: string) => void
}

export function AppShell({
  children, username, role, defaultOpen,
  wsStatus, breadcrumb, searchSlot, activeId, onSelect,
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar username={username} role={role} activeId={activeId} onSelect={onSelect} />
      <SidebarInset>
        <Topbar breadcrumb={breadcrumb} wsStatus={wsStatus} searchSlot={searchSlot} />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
