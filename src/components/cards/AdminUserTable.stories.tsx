import type { Meta, StoryObj } from '@storybook/react-vite'
import { AdminUserTable } from './AdminUserTable'
import type { AdminUser } from './AdminUserTable'
import { fn } from 'storybook/test'

const users: AdminUser[] = [
  { id: 1, username: 'zakaria',   email: 'zakaria@crowdsignal.dev',  role: 'admin',   isActive: true,  dateJoined: '2 weeks ago' },
  { id: 2, username: 'alice',     email: 'alice@crowdsignal.dev',    role: 'analyst', isActive: true,  dateJoined: '5 days ago'  },
  { id: 3, username: 'bob_trade', email: 'bob@crowdsignal.dev',      role: 'user',    isActive: false, dateJoined: '1 month ago' },
]

const meta: Meta<typeof AdminUserTable> = {
  title: 'Admin/AdminUserTable',
  component: AdminUserTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'User management table. Maps `GET /api/auth/admin/users/`. Displays role badge, active status badge, and optional edit/delete CTAs.',
      },
    },
  },
  args: { onEdit: fn(), onDelete: fn() },
}
export default meta

type Story = StoryObj<typeof AdminUserTable>

export const WithUsers:    Story = { args: { users } }
export const ReadOnly:     Story = { args: { users, onEdit: undefined, onDelete: undefined } }
export const Empty:        Story = { args: { users: [] } }
