import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { EmptyState } from './EmptyState'
import { Icons } from '@/components/design-system'

const meta: Meta<typeof EmptyState> = {
  title: 'Layout/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof EmptyState>

export const Basic: Story = {
  args: { title: 'No signals yet' },
}

export const WithDescription: Story = {
  args: {
    title:       'No alerts',
    description: 'When the system detects anomalies they will appear here.',
    icon:        <Icons.Bell size={40} />,
  },
}

export const WithAction: Story = {
  args: {
    title:       'No strategies',
    description: 'Create your first automated strategy to get started.',
    icon:        <Icons.BarChart size={40} />,
    action:      <button className="btn btn-primary btn-sm">Create Strategy</button>,
  },
}
