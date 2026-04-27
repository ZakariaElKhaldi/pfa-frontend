import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { AppShell } from './AppShell'
import { PageHeader } from './PageHeader'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof AppShell> = {
  title: 'Layout/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
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
          action={
            <button className="btn btn-primary" onClick={() => console.log('clicked')}>
              Connect Account
            </button>
          }
        />
      </div>
    </div>
  )
}

export const DashboardLayout: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <div className="h-screen">
        <AppShell activeId={activeId} username="Zakaria" role="super_user" onSelect={setActiveId}>
          <ShellContent title="Dashboard" subtitle="Welcome back to Sentient Terminal. Here's what's happening." />
        </AppShell>
      </div>
    )
  },
}

export const AdminDashboard: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <div className="h-screen">
        <AppShell activeId={activeId} username="Admin User" role="admin" onSelect={setActiveId}>
          <ShellContent title="Dashboard" subtitle="Admin view — full platform overview." />
        </AppShell>
      </div>
    )
  },
}

export const AnalystSignals: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('signals')
    return (
      <div className="h-screen">
        <AppShell activeId={activeId} username="Jane Analyst" role="analyst" onSelect={setActiveId}>
          <ShellContent title="Signals" subtitle="Live signal feed from social + on-chain sources." />
        </AppShell>
      </div>
    )
  },
}

export const UserPortfolio: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('portfolio')
    return (
      <div className="h-screen">
        <AppShell activeId={activeId} username="John Trader" role="user" onSelect={setActiveId}>
          <ShellContent title="Portfolio" subtitle="Track your holdings and performance." />
        </AppShell>
      </div>
    )
  },
}

export const MarketPage: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('market')
    return (
      <div className="h-screen">
        <AppShell activeId={activeId} username="Zakaria" role="super_user" onSelect={setActiveId}>
          <ShellContent title="Market" subtitle="Real-time market data and sentiment overview." />
        </AppShell>
      </div>
    )
  },
}

export const CollapsedSidebar: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')
    return (
      <div className="h-screen">
        <AppShell activeId={activeId} username="Zakaria" role="super_user" onSelect={setActiveId} defaultOpen={false}>
          <ShellContent title="Dashboard" subtitle="Sidebar starts collapsed — icon-only mode." />
        </AppShell>
      </div>
    )
  },
}
