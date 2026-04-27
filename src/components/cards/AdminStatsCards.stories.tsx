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
          'KPI grid for the admin dashboard. Maps `GET /api/auth/admin/stats/`. Each card has an accent top-border matching its semantic colour.',
      },
    },
  },
  argTypes: {
    totalUsers:  { control: { type: 'number' } },
    activeUsers: { control: { type: 'number' } },
    adminUsers:  { control: { type: 'number' } },
    newThisWeek: { control: { type: 'number' } },
  },
}
export default meta

type Story = StoryObj<typeof AdminStatsCards>

export const Default: Story = {
  args: { totalUsers: 248, activeUsers: 215, adminUsers: 3, newThisWeek: 12 },
}
