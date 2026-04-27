import type { ReactNode } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
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
