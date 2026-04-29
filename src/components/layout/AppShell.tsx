import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import type { UserRole } from '@/components/design-system/RoleBadge'

interface AppShellProps {
  children: ReactNode
  username?: string
  role?: UserRole
  defaultOpen?: boolean
  /** Storybook/test: controlled active id passed through to AppSidebar */
  activeId?: string
  /** Storybook/test: nav click handler passed through to AppSidebar */
  onSelect?: (id: string) => void
}

export function AppShell({ children, username, role, defaultOpen, activeId, onSelect }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar username={username} role={role} activeId={activeId} onSelect={onSelect} />
      <SidebarInset>
        <header
          className="sticky top-0 z-10 flex h-[var(--topbar-height)] items-center gap-3 px-4 border-b bg-[var(--surface-container-lowest)]"
          style={{ borderBottomColor: 'var(--outline-variant)' }}
        >
          <SidebarTrigger />
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
