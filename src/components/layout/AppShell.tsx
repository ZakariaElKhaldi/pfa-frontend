import type { ReactNode } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'

interface AppShellProps {
  children: ReactNode
  activeId: string
  onSelect: (id: string) => void
  username?: string
  role?: string
  defaultOpen?: boolean
}

export function AppShell({ children, activeId, onSelect, username, role, defaultOpen }: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar activeId={activeId} onSelect={onSelect} username={username} role={role} />
      <div className="flex flex-col flex-1 min-w-0">
        <div style={{ position: 'sticky', top: 0, zIndex: 'var(--z-raised)', display: 'flex', alignItems: 'center', height: 'var(--topbar-height)', padding: '0 var(--space-4)', borderBottom: '1px solid var(--outline-variant)', background: 'var(--surface-container-lowest)' }}>
          <SidebarTrigger />
        </div>
        {children}
      </div>
    </SidebarProvider>
  )
}
