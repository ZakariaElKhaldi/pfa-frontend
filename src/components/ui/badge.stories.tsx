import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link', 'buy', 'sell', 'hold', 'success', 'warning', 'info', 'error'],
    },
  },
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = { args: { children: 'Badge', variant: 'default' } }
export const Secondary: Story = { args: { children: 'Secondary', variant: 'secondary' } }
export const Destructive: Story = { args: { children: 'Destructive', variant: 'destructive' } }
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } }

/* Trading signal badges */
export const Buy: Story = {
  render: () => (
    <Badge variant="buy">
      <TrendingUp /> BUY
    </Badge>
  ),
}

export const Sell: Story = {
  render: () => (
    <Badge variant="sell">
      <TrendingDown /> SELL
    </Badge>
  ),
}

export const Hold: Story = {
  render: () => (
    <Badge variant="hold">
      <Minus /> HOLD
    </Badge>
  ),
}

/* Semantic badges */
export const Success: Story = { args: { children: 'Filled', variant: 'success' } }
export const Warning: Story = { args: { children: 'Margin call', variant: 'warning' } }
export const Info: Story = { args: { children: 'Live', variant: 'info' } }
export const Error: Story = { args: { children: 'Error', variant: 'error' } }

export const AllGeneric: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  ),
}

export const SignalBadges: Story = {
  name: 'Signal Badges (trading-exclusive)',
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="buy"><TrendingUp />BUY</Badge>
      <Badge variant="sell"><TrendingDown />SELL</Badge>
      <Badge variant="hold"><Minus />HOLD</Badge>
    </div>
  ),
}

export const SemanticBadges: Story = {
  name: 'Semantic Badges (UI context)',
  render: () => (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge variant="success">Filled</Badge>
      <Badge variant="warning">Margin call</Badge>
      <Badge variant="info">Live</Badge>
      <Badge variant="error">Failed</Badge>
    </div>
  ),
}
