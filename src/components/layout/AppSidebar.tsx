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
import { Icons } from '@/components/design-system'
import { NAV_ITEMS } from '@/pages/design-system/fixtures'

interface AppSidebarProps {
  activeId: string
  onSelect: (id: string) => void
  username?: string
  role?: string
}

export function AppSidebar({ activeId, onSelect, username = 'User', role = 'user' }: AppSidebarProps) {
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] shadow-sm"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Icons.Logo size={18} color="white" strokeWidth={2.5} />
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
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map(item => {
              const Icon = Icons[item.icon]
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeId === item.id}
                    onClick={() => onSelect(item.id)}
                    tooltip={item.label}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeId === 'settings'}
                onClick={() => onSelect('settings')}
                tooltip="Settings"
              >
                <Icons.Settings size={18} />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex cursor-default items-center gap-3 px-1 py-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          <div
            className="avatar avatar-sm shrink-0"
            aria-label={`User: ${initials}`}
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-title-md truncate">{username}</span>
            <span className="text-body-sm capitalize truncate" style={{ fontSize: '10px' }}>{role}</span>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
