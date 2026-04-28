import type { Meta, StoryObj } from '@storybook/react-vite'
import { AdminStatsCards } from './AdminStatsCards'

const meta: Meta<typeof AdminStatsCards> = {
  title: 'Admin/AdminStatsCards',
  component: AdminStatsCards,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'KPI grid for the admin dashboard. Maps `GET /api/auth/admin/stats/` — fields are `total_users`, `total_tickers`, `signals_today`, `total_posts`.',
      },
    },
  },
  argTypes: {
    totalUsers:   { control: { type: 'number' } },
    totalTickers: { control: { type: 'number' } },
    signalsToday: { control: { type: 'number' } },
    totalPosts:   { control: { type: 'number' } },
  },
}
export default meta

type Story = StoryObj<typeof AdminStatsCards>

export const Default: Story = {
  args: { totalUsers: 248, totalTickers: 31, signalsToday: 124, totalPosts: 18450 },
}

export const EarlyStage: Story = {
  args: { totalUsers: 12, totalTickers: 5, signalsToday: 10, totalPosts: 280 },
  parameters: { docs: { description: { story: 'Low-traffic early deployment.' } } },
}
