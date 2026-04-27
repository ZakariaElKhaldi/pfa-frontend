import type { Meta, StoryObj } from '@storybook/react-vite'

import { TickerCard } from './TickerCard'

const meta: Meta<typeof TickerCard> = {
  title: 'Cards/TickerCard',
  component: TickerCard,
  tags: ['autodocs'],
  argTypes: {
    signal: { control: 'radio', options: ['BUY', 'SELL', 'HOLD'] },
  },
}
export default meta

type Story = StoryObj<typeof TickerCard>

export const Buy: Story = {
  args: {
    symbol: 'AAPL',
    name:   'Apple Inc.',
    price:  '189.42',
    change: '+2.31',
    pct:    '1.23%',
    signal: 'BUY',
  },
}

export const Sell: Story = {
  args: {
    symbol: 'META',
    name:   'Meta Platforms',
    price:  '482.10',
    change: '-8.90',
    pct:    '1.81%',
    signal: 'SELL',
  },
}

export const Hold: Story = {
  args: {
    symbol: 'MSFT',
    name:   'Microsoft Corp.',
    price:  '424.55',
    change: '+0.12',
    pct:    '0.03%',
    signal: 'HOLD',
  },
}

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      <TickerCard symbol="AAPL" name="Apple Inc."       price="189.42" change="+2.31" pct="1.23%" signal="BUY"  />
      <TickerCard symbol="META" name="Meta Platforms"   price="482.10" change="-8.90" pct="1.81%" signal="SELL" />
      <TickerCard symbol="MSFT" name="Microsoft Corp."  price="424.55" change="+0.12" pct="0.03%" signal="HOLD" />
    </div>
  ),
}
