import type { Meta, StoryObj } from '@storybook/react-vite'

import { RoleGate } from './RoleGate'

const meta: Meta<typeof RoleGate> = {
  title: 'Layout/RoleGate',
  component: RoleGate,
  tags: ['autodocs'],
  argTypes: {
    role:    { control: 'radio', options: ['user', 'analyst', 'admin'] },
    require: { control: 'radio', options: ['user', 'analyst', 'admin', 'analyst+admin'] },
  },
}
export default meta

type Story = StoryObj<typeof RoleGate>

export const AnalystCanAccess: Story = {
  args: {
    role:     'analyst',
    require:  'analyst+admin',
    children: <div className="badge badge-buy">Analyst content visible</div>,
    fallback: <div className="badge badge-neutral">Access denied</div>,
  },
}

export const UserBlocked: Story = {
  args: {
    role:     'user',
    require:  'analyst+admin',
    children: <div className="badge badge-buy">Analyst content visible</div>,
    fallback: <div className="badge badge-neutral">Access denied</div>,
  },
}

export const AdminSeesEverything: Story = {
  args: {
    role:     'admin',
    require:  'admin',
    children: <div className="badge badge-sell">Admin-only content</div>,
    fallback: <div className="badge badge-neutral">Access denied</div>,
  },
}
