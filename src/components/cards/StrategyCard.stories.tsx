import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { useState } from 'react'

import { StrategyCard } from './StrategyCard'

const meta: Meta<typeof StrategyCard> = {
  title: 'Cards/StrategyCard',
  component: StrategyCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Strategy row card. Toggle wires to `POST /api/strategies/<pk>/toggle/`. `onEdit` opens `StrategyForm` for `PATCH /api/strategies/<pk>/`. `onDelete` triggers `DELETE /api/strategies/<pk>/`.',
      },
    },
  },
  args: { onToggle: fn(), onEdit: fn(), onDelete: fn() },
}
export default meta

type Story = StoryObj<typeof StrategyCard>

const base = {
  id:         's1',
  name:       'Sentiment Momentum',
  desc:       'Buy when 7-day sentiment score > 0.7 and momentum > 0.5',
  tickers:    ['AAPL', 'MSFT', 'GOOGL'],
  executions: 48,
  lastRun:    '2h ago',
}

export const Active: Story = {
  args: { ...base, active: true },
}

export const Inactive: Story = {
  args: {
    ...base,
    id:   's2',
    name: 'Contrarian Fade',
    desc: 'Sell when sentiment diverges from price action by >30%',
    tickers: ['GME', 'AMC'],
    executions: 12,
    lastRun: '3d ago',
    active: false,
  },
}

export const ReadOnly: Story = {
  args: { ...base, active: true, onEdit: undefined, onDelete: undefined },
  parameters: { docs: { description: { story: 'No edit/delete callbacks — icon buttons not rendered.' } } },
}

export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState(false)
    return (
      <StrategyCard
        {...base}
        active={active}
        onToggle={setActive}
        onEdit={fn()}
        onDelete={fn()}
      />
    )
  },
  parameters: { docs: { description: { story: 'Live toggle — click the switch to see active state change.' } } },
}
