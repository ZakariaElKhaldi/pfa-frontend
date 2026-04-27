import type { Meta, StoryObj } from '@storybook/react-vite'

import { SignalBadge } from './SignalBadge'

const meta: Meta<typeof SignalBadge> = {
  title: 'Design System/SignalBadge',
  component: SignalBadge,
  tags: ['autodocs'],
  argTypes: {
    signal: { control: 'radio', options: ['BUY', 'SELL', 'HOLD'] },
    size:   { control: 'radio', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type Story = StoryObj<typeof SignalBadge>

export const Buy:  Story = { args: { signal: 'BUY',  size: 'lg' } }
export const Sell: Story = { args: { signal: 'SELL', size: 'lg' } }
export const Hold: Story = { args: { signal: 'HOLD', size: 'lg' } }

export const AllSignals: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <SignalBadge signal="BUY" />
      <SignalBadge signal="SELL" />
      <SignalBadge signal="HOLD" />
    </div>
  ),
}
