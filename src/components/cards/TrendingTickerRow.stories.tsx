import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingTickerRow } from './TrendingTickerRow'
import { fn } from 'storybook/test'

const meta: Meta<typeof TrendingTickerRow> = {
  title: 'Social/TrendingTickerRow',
  component: TrendingTickerRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single row in the trending tickers list. Maps `GET /api/social/trending/`. Bullish ratio ≥ 0.55 = green, ≤ 0.45 = red, between = grey. Clickable when `onClick` is provided.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 380, background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 4 }}><Story /></div>],
  args: { onClick: fn() },
}
export default meta

type Story = StoryObj<typeof TrendingTickerRow>

export const Bullish: Story = {
  args: { rank: 1, symbol: 'AAPL', name: 'Apple Inc.', postCount: 4820, bullishRatio: 0.78 },
}

export const Bearish: Story = {
  args: { rank: 2, symbol: 'META', name: 'Meta Platforms', postCount: 2100, bullishRatio: 0.29 },
}

export const Neutral: Story = {
  args: { rank: 3, symbol: 'GOOG', name: 'Alphabet Inc.', postCount: 900, bullishRatio: 0.51 },
}

export const Feed: Story = {
  parameters: { docs: { description: { story: 'Stacked trending feed as it appears in the Social surface.' } } },
  render: () => (
    <div style={{ width: 380, background: 'var(--surface-container)', borderRadius: 'var(--radius-lg)', padding: 4 }}>
      {[
        { rank: 1, symbol: 'AAPL', name: 'Apple Inc.',        postCount: 4820, bullishRatio: 0.78 },
        { rank: 2, symbol: 'NVDA', name: 'NVIDIA Corp.',       postCount: 3900, bullishRatio: 0.81 },
        { rank: 3, symbol: 'META', name: 'Meta Platforms',     postCount: 2100, bullishRatio: 0.29 },
        { rank: 4, symbol: 'TSLA', name: 'Tesla Inc.',         postCount: 1850, bullishRatio: 0.44 },
        { rank: 5, symbol: 'GOOG', name: 'Alphabet Inc.',      postCount: 900,  bullishRatio: 0.51 },
      ].map((t) => <TrendingTickerRow key={t.symbol} {...t} onClick={() => {}} />)}
    </div>
  ),
}
