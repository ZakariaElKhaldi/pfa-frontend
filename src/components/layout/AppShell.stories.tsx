import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MemoryRouter } from 'react-router'
import { AppShell } from './AppShell'
import { PageHeader } from './PageHeader'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="h-screen">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof AppShell>

function ShellContent({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="p-6">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mt-6">
        <EmptyState
          title="No data available"
          description="Connect your accounts to start visualizing data."
          action={<button className="btn btn-primary">Connect Account</button>}
        />
      </div>
    </div>
  )
}

export const UserDashboard: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <AppShell activeId={activeId} username="John Trader" role="user" onSelect={setActiveId}>
        <ShellContent title="Dashboard" subtitle="Welcome back to Sentient Terminal." />
      </AppShell>
    )
  },
}

export const AnalystSignals: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('analytics')
    return (
      <AppShell activeId={activeId} username="Jane Analyst" role="analyst" onSelect={setActiveId}>
        <ShellContent title="Analytics" subtitle="Cross-ticker intelligence and backtest tools." />
      </AppShell>
    )
  },
}

export const AdminDashboard: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('admin')
    return (
      <AppShell activeId={activeId} username="Admin User" role="admin" onSelect={setActiveId}>
        <ShellContent title="Admin" subtitle="Full platform overview and user management." />
      </AppShell>
    )
  },
}

export const CollapsedSidebar: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <AppShell activeId={activeId} username="Zakaria" role="user" defaultOpen={false} onSelect={setActiveId}>
        <ShellContent title="Dashboard" subtitle="Sidebar starts collapsed — icon-only mode." />
      </AppShell>
    )
  },
}

/** New: Topbar with breadcrumb — simulates a strategy detail route */
export const WithBreadcrumb: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('strategies')
    return (
      <AppShell
        activeId={activeId}
        username="Jane Analyst"
        role="analyst"
        onSelect={setActiveId}
        breadcrumb={[
          { label: 'Strategies', href: '/strategies' },
          { label: 'Momentum Alpha v2' },
        ]}
      >
        <ShellContent title="Momentum Alpha v2" subtitle="Automated signal-driven strategy." />
      </AppShell>
    )
  },
}

/** New: WebSocket connected status in topbar */
export const WSConnected: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <AppShell activeId={activeId} username="John Trader" role="user" wsStatus="connected" onSelect={setActiveId}>
        <ShellContent title="Dashboard" subtitle="Live feed connected." />
      </AppShell>
    )
  },
}

/** New: WebSocket disconnected — shows orange/red indicator */
export const WSDisconnected: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <AppShell activeId={activeId} username="John Trader" role="user" wsStatus="disconnected" onSelect={setActiveId}>
        <ShellContent title="Dashboard" subtitle="Live feed disconnected — data may be stale." />
      </AppShell>
    )
  },
}
