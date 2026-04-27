import type { Meta, StoryObj } from '@storybook/react-vite'
import { QuoteCard } from './QuoteCard'

const meta: Meta<typeof QuoteCard> = {
  title: 'Cards/QuoteCard',
  component: QuoteCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Real-time quote card for a single ticker. Displays last price, directional change, bid/ask/spread, and optional volume. Data from `GET /api/tickers/:symbol/quote/`.',
      },
    },
  },
  decorators: [(Story) => <div style={{ width: 420 }}><Story /></div>],
  argTypes: {
    last:      { control: { type: 'number' } },
    bid:       { control: { type: 'number' } },
    ask:       { control: { type: 'number' } },
    change:    { control: { type: 'number' } },
    changePct: { control: { type: 'number', min: -100, max: 100, step: 0.01 } },
    volume:    { control: { type: 'number' } },
  },
}
export default meta

type Story = StoryObj<typeof QuoteCard>

export const Bullish: Story = {
  args: {
    symbol: 'AAPL', name: 'Apple Inc.',
    last: 189.84, bid: 189.80, ask: 189.88, change: 4.32, changePct: 2.33, volume: 54_200_000,
  },
}

export const Bearish: Story = {
  args: {
    symbol: 'META', name: 'Meta Platforms Inc.',
    last: 472.15, bid: 472.10, ask: 472.20, change: -18.35, changePct: -3.74, volume: 22_800_000,
  },
}

export const NoVolume: Story = {
  parameters: { docs: { description: { story: 'showVolume=false — useful for crypto assets where volume is not relevant.' } } },
  args: {
    symbol: 'BTC', name: 'Bitcoin',
    last: 68_450, bid: 68_440, ask: 68_460, change: 1250, changePct: 1.86, volume: 0, showVolume: false,
  },
}
