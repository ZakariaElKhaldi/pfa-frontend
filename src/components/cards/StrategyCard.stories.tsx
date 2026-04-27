import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { StrategyCard } from './StrategyCard'

const meta: Meta<typeof StrategyCard> = {
  title: 'Cards/StrategyCard',
  component: StrategyCard,
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof StrategyCard>

export const Active: Story = {
  args: {
    id:         's1',
    name:       'Sentiment Momentum',
    desc:       'Buy when 7-day sentiment score > 0.7 and momentum > 0.5',
    tickers:    ['AAPL', 'MSFT', 'GOOGL'],
    executions: 48,
    lastRun:    '2h ago',
    active:     true,
    onToggle:   () => {},
  },
}

export const Inactive: Story = {
  args: {
    id:         's2',
    name:       'Contrarian Fade',
    desc:       'Sell when sentiment diverges from price action by >30%',
    tickers:    ['GME', 'AMC'],
    executions: 12,
    lastRun:    '3d ago',
    active:     false,
    onToggle:   () => {},
  },
}

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState(false)
    return (
      <StrategyCard
        id="demo"
        name="Sentiment Momentum"
        desc="Buy when 7-day sentiment score > 0.7 and momentum > 0.5"
        tickers={['AAPL', 'MSFT', 'GOOGL']}
        executions={48}
        lastRun="2h ago"
        active={active}
        onToggle={setActive}
      />
    )
  },
}
