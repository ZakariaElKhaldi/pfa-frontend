import type { Meta, StoryObj } from '@storybook/react-vite'
import { Home, Settings, Inbox, User } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './sidebar'

const meta: Meta<typeof Sidebar> = {
  title: 'UI/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4 border-b">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center">S</div>
            Storybook
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Inbox />
                    <span>Inbox</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <User />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Preferences</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <div className="text-xs text-muted-foreground">Logged in as Zakaria</div>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 p-6">
        <SidebarTrigger />
        <h1 className="text-2xl font-bold mt-4">Main Content Area</h1>
        <p className="mt-4 text-muted-foreground">The sidebar is rendered on the left. You can toggle it using the trigger above.</p>
      </main>
    </SidebarProvider>
  ),
}
