import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { DashboardPagePreview } from './DashboardPage'

const meta: Meta<typeof DashboardPagePreview> = {
  title: 'Pages/Dashboard',
  component: DashboardPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof DashboardPagePreview>

export const Default: Story = {}

export const NoAlerts: Story = {
  args: { alerts: [] },
}

export const EmptySignals: Story = {
  args: { signals: [] },
}
