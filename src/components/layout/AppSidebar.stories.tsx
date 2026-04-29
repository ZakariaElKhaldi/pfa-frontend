import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

const meta: Meta<typeof AppSidebar> = {
  title: 'Layout/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <SidebarProvider>
          <Story />
        </SidebarProvider>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AppSidebar>

export const UserRole: Story = {
  args: { activeId: 'dashboard', username: 'John Trader', role: 'user', onSelect: (id) => console.log('Selected:', id) },
}

export const AnalystRole: Story = {
  args: { activeId: 'analytics', username: 'Jane Analyst', role: 'analyst', onSelect: (id) => console.log('Selected:', id) },
}

export const AdminRole: Story = {
  args: { activeId: 'admin', username: 'Admin User', role: 'admin', onSelect: (id) => console.log('Selected:', id) },
}

export const CollapsedIconMode: Story = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <SidebarProvider defaultOpen={false}>
          <Story />
        </SidebarProvider>
      </MemoryRouter>
    ),
  ],
  args: { activeId: 'dashboard', username: 'Zakaria', role: 'user', onSelect: (id) => console.log('Selected:', id) },
}

export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <MemoryRouter>
        <SidebarProvider>
          <AppSidebar activeId={activeId} username="Zakaria" role="admin" onSelect={setActiveId} />
        </SidebarProvider>
      </MemoryRouter>
    )
  },
}
