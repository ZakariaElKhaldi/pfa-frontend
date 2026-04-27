import type { Meta, StoryObj } from '@storybook/react-vite'

import { RoleBadge } from './RoleBadge'
import type { UserRole } from './RoleBadge'

const meta: Meta<typeof RoleBadge> = {
  title: 'Design System/RoleBadge',
  component: RoleBadge,
  tags: ['autodocs'],
  argTypes: {
    role: { control: 'radio', options: ['user', 'analyst', 'admin'] satisfies UserRole[] },
  },
}
export default meta

type Story = StoryObj<typeof RoleBadge>

export const User:    Story = { args: { role: 'user'    } }
export const Analyst: Story = { args: { role: 'analyst' } }
export const Admin:   Story = { args: { role: 'admin'   } }

export const AllRoles: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <RoleBadge role="user" />
      <RoleBadge role="analyst" />
      <RoleBadge role="admin" />
    </div>
  ),
}
