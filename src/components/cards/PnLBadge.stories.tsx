import type { Meta, StoryObj } from '@storybook/react-vite'
import { PnLBadge } from './PnLBadge'

const meta: Meta<typeof PnLBadge> = {
  title: 'Cards/PnLBadge',
  component: PnLBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Inline P&L delta chip. Positive values render green with ↑, negative red with ↓. Use wherever a profit/loss figure appears inline — positions table, portfolio summary, trade row.',
      },
    },
  },
  argTypes: {
    value: { control: { type: 'number' }, description: 'Absolute P&L in USD' },
    pct:   { control: { type: 'number', min: -100, max: 100, step: 0.01 }, description: 'Percentage alongside dollar (optional)' },
    size:  { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof PnLBadge>

export const Profit: Story = {
  parameters: { docs: { description: { story: 'Positive value — green arrow up.' } } },
  args: { value: 1234.56, pct: 12.34, size: 'md' },
}

export const Loss: Story = {
  parameters: { docs: { description: { story: 'Negative value — red arrow down.' } } },
  args: { value: -567.89, pct: -5.67, size: 'md' },
}

export const Breakeven: Story = {
  args: { value: 0, pct: 0 },
}

export const Sm: Story = {
  args: { value: 320, pct: 3.2, size: 'sm' },
}

export const Lg: Story = {
  args: { value: 48200, pct: 48.2, size: 'lg' },
}
