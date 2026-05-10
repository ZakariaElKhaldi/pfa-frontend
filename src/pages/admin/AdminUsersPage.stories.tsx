import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AdminUsersPage } from './AdminUsersPage'

const meta: Meta<typeof AdminUsersPage> = {
  title: 'Pages/Admin/Users',
  component: AdminUsersPage,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AdminUsersPage>

export const Default: Story = {}
