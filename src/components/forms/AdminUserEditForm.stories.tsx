import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { AdminUserEditForm } from './AdminUserEditForm'

const meta: Meta<typeof AdminUserEditForm> = {
  title: 'Forms/AdminUserEditForm',
  component: AdminUserEditForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Admin form for editing a user\'s `username`, `email`, and `role`. Maps to `PATCH /api/auth/admin/users/<pk>/`. Submit and Reset are disabled until the form is dirty. Pair with a Dialog or Sheet at the page level.',
      },
    },
  },
  args: { onSubmit: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof AdminUserEditForm>

const baseInitial = { username: 'alice', email: 'alice@crowdsignal.dev', role: 'user' as const }

export const Default: Story = {
  args: { initial: baseInitial },
}

export const AdminUser: Story = {
  args: { initial: { username: 'zakaria', email: 'zakaria@crowdsignal.dev', role: 'admin' } },
  parameters: { docs: { description: { story: 'Admin role pre-selected.' } } },
}

export const AnalystUser: Story = {
  args: { initial: { username: 'bob_analyst', email: 'bob@crowdsignal.dev', role: 'analyst' } },
}

export const Loading: Story = {
  args: { initial: baseInitial, loading: true },
}

export const WithError: Story = {
  args: { initial: baseInitial, error: 'Email is already taken by another account.' },
}
