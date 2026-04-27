import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { PageHeader } from './PageHeader'

const meta: Meta<typeof PageHeader> = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof PageHeader>

export const TitleOnly: Story = {
  args: { title: 'Dashboard' },
}

export const WithSubtitle: Story = {
  args: { title: 'Market Feed', subtitle: 'Real-time social sentiment and price signals' },
}

export const WithActions: Story = {
  args: {
    title:    'Strategies',
    subtitle: 'Manage your automated trading strategies',
    actions:  <button className="btn btn-primary btn-sm">New Strategy</button>,
  },
}
