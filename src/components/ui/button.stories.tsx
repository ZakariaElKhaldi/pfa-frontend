import type { Meta, StoryObj } from '@storybook/react-vite'
import { Mail, ChevronRight, Settings, TrendingUp, TrendingDown } from 'lucide-react'

import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link', 'buy', 'sell'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = { args: { children: 'Button', variant: 'default' } }
export const Secondary: Story = { args: { children: 'Secondary', variant: 'secondary' } }
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } }
export const Ghost: Story = { args: { children: 'Ghost', variant: 'ghost' } }
export const Destructive: Story = { args: { children: 'Destructive', variant: 'destructive' } }
export const Link: Story = { args: { children: 'Link', variant: 'link' } }

export const BuySignal: Story = {
  name: 'Buy (signal action)',
  render: () => (
    <Button variant="buy">
      <TrendingUp /> Buy AAPL
    </Button>
  ),
}

export const SellSignal: Story = {
  name: 'Sell (signal action)',
  render: () => (
    <Button variant="sell">
      <TrendingDown /> Sell TSLA
    </Button>
  ),
}

export const Loading: Story = {
  render: () => (
    <Button loading>
      Executing order…
    </Button>
  ),
}

export const Disabled: Story = { args: { children: 'Disabled', disabled: true } }

export const WithIconStart: Story = {
  render: () => (
    <Button>
      <Mail /> Login with Email
    </Button>
  ),
}

export const WithIconEnd: Story = {
  render: () => (
    <Button variant="outline">
      Next steps <ChevronRight />
    </Button>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const IconOnly: Story = {
  render: () => (
    <Button size="icon" aria-label="Settings">
      <Settings />
    </Button>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button variant="buy"><TrendingUp />Buy</Button>
      <Button variant="sell"><TrendingDown />Sell</Button>
    </div>
  ),
}
