import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../index.css'
import { MetricCard } from './MetricCard'

const meta: Meta<typeof MetricCard> = {
  title: 'Cards/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
  argTypes: {
    positive: { control: 'boolean' },
  },
}
export default meta

type Story = StoryObj<typeof MetricCard>

export const Positive: Story = {
  args: { label: 'Win Rate', value: '67.4%', delta: '+3.2% this month', positive: true },
}

export const Negative: Story = {
  args: { label: 'Drawdown', value: '-4.1%', delta: '-1.8% vs last month', positive: false },
}

export const Row: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      <MetricCard label="Win Rate"    value="67.4%" delta="+3.2%"  positive={true}  />
      <MetricCard label="Total Trades" value="142"  delta="+18"    positive={true}  />
      <MetricCard label="Drawdown"    value="-4.1%" delta="-1.8%"  positive={false} />
      <MetricCard label="Sharpe"      value="1.83"  delta="+0.12"  positive={true}  />
    </div>
  ),
}
