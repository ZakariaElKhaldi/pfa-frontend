import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AdminDashboardPage } from './AdminDashboardPage'

const meta: Meta<typeof AdminDashboardPage> = {
  title: 'Pages/Admin/Dashboard',
  component: AdminDashboardPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AdminDashboardPage>

export const Default: Story = {}
