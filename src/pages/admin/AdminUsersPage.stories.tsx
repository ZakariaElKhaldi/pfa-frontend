import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router'
import { AdminUsersPagePreview } from './AdminUsersPage'

const meta: Meta<typeof AdminUsersPagePreview> = {
  title: 'Pages/Admin/Users',
  component: AdminUsersPagePreview,
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof AdminUsersPagePreview>

export const Default: Story = {}
