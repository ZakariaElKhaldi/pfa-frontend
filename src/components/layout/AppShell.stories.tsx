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

export const DashboardLayout: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeId, setActiveId] = useState('dashboard')

    return (
      <div className="h-screen bg-surface-lowest">
        <AppShell
          activeId={activeId}
          username="Zakaria"
          role="super_user"
          onSelect={setActiveId}
        >
          <div className="p-6">
            <PageHeader 
              title="Dashboard" 
              description="Welcome back to Sentient Terminal. Here's what's happening."
            />
            <div className="mt-6">
              <EmptyState 
                title="No data available" 
                description="Connect your accounts to start visualizing data."
                action={
                  <button className="btn btn-primary" onClick={() => console.log("clicked")}>
                    Connect Account
                  </button>
                }
              />
            </div>
          </div>
        </AppShell>
      </div>
    )
  },
}
