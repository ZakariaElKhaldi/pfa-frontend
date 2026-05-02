import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AdminDashboardPagePreview } from './AdminDashboardPage'

const meta: Meta<typeof AdminDashboardPagePreview> = {
  title: 'Pages/Admin/Dashboard',
  component: AdminDashboardPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AdminDashboardPagePreview>

export const Default: Story = {}

export const HighActivity: Story = {
  args: { stats: { total_users: 5120, total_tickers: 512, signals_today: 8200, total_posts: 420000 } },
}
