import type { Meta, StoryObj } from '@storybook/react-vite'

import { AlertCard } from './AlertCard'
import type { AlertType } from '@/components/design-system/AlertTypeBadge'

const meta: Meta<typeof AlertCard> = {
  title: 'Cards/AlertCard',
  component: AlertCard,
  tags: ['autodocs'],
  argTypes: {
    type:     { control: 'radio', options: ['divergence', 'extreme_sentiment', 'hype_fade', 'pump_suspected'] satisfies AlertType[] },
    resolved: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof AlertCard>

export const Divergence: Story = {
  args: { type: 'divergence', symbol: 'AAPL', sentiment: 0.82, momentum: 0.31, consistency: 0.78 },
}

export const ExtremeSentiment: Story = {
  args: { type: 'extreme_sentiment', symbol: 'GME', sentiment: 0.97, momentum: 0.91, consistency: 0.88, onResolve: () => {} },
}

export const PumpSuspected: Story = {
  args: { type: 'pump_suspected', symbol: 'AMC', sentiment: 0.94, momentum: 0.89, consistency: 0.85, onResolve: () => {} },
}

export const Resolved: Story = {
  args: { type: 'divergence', symbol: 'TSLA', sentiment: 0.72, momentum: 0.55, consistency: 0.68, resolved: true },
}

export const Stack: Story = {
  render: () => (
    <div className="stack stack-3" style={{ maxWidth: 560 }}>
      <AlertCard type="pump_suspected"   symbol="GME"  sentiment={0.97} momentum={0.91} consistency={0.88} onResolve={() => {}} />
      <AlertCard type="extreme_sentiment" symbol="AMC" sentiment={0.94} momentum={0.89} consistency={0.85} onResolve={() => {}} />
      <AlertCard type="divergence"        symbol="AAPL" sentiment={0.82} momentum={0.31} consistency={0.78} resolved />
    </div>
  ),
}
