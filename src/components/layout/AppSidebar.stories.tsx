import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { AppSidebar } from './AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

const meta: Meta<typeof AppSidebar> = {
  title: 'Layout/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AppSidebar>

export const Default: Story = {
  args: {
    activeId: 'dashboard',
    username: 'Zakaria',
    role: 'super_user',
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const AdminRole: Story = {
  args: {
    activeId: 'dashboard',
    username: 'Admin User',
    role: 'admin',
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const AnalystRole: Story = {
  args: {
    activeId: 'signals',
    username: 'Jane Analyst',
    role: 'analyst',
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const UserRole: Story = {
  args: {
    activeId: 'portfolio',
    username: 'John Trader',
    role: 'user',
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const CollapsedIconMode: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <Story />
      </SidebarProvider>
    ),
  ],
  args: {
    activeId: 'dashboard',
    username: 'Zakaria',
    role: 'super_user',
    onSelect: (id) => console.log('Selected:', id),
  },
}

export const Interactive: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <AppSidebar
        activeId={activeId}
        username="Zakaria"
        role="super_user"
        onSelect={setActiveId}
      />
    )
  },
}
