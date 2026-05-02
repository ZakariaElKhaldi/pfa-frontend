import type { Meta, StoryObj } from '@storybook/react-vite'
import { ScrollArea } from './scroll-area'

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof ScrollArea>

const TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'AVGO', 'ORCL', 'NFLX',
  'AMD', 'INTC', 'CRM', 'ADBE', 'CSCO', 'IBM', 'QCOM', 'TXN', 'NOW', 'SNOW',
  'PLTR', 'COIN', 'SHOP', 'UBER', 'ABNB', 'PYPL', 'DIS', 'BA', 'GE', 'XOM',
]

export const VerticalList: Story = {
  render: () => (
    <ScrollArea className="h-72 w-64 rounded-lg border border-border p-3">
      <div className="space-y-1.5">
        {TICKERS.map((t, i) => (
          <div
            key={t}
            className="flex items-center justify-between rounded px-3 py-2 text-sm hover:bg-accent/40"
          >
            <span className="font-mono">{t}</span>
            <span className={i % 3 === 0 ? 'text-emerald-500' : i % 3 === 1 ? 'text-rose-500' : 'text-amber-500'}>
              {i % 3 === 0 ? 'BUY' : i % 3 === 1 ? 'SELL' : 'HOLD'}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const LongText: Story = {
  render: () => (
    <ScrollArea className="h-60 w-96 rounded-lg border border-border p-4 text-sm">
      <p className="leading-relaxed">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i}>
            CrowdSignal aggregates social sentiment across Reddit, StockTwits, and news streams,
            scoring each post with FinBERT and rolling them up into BUY/SELL/HOLD decisions.
            Latency from post-fetch to signal emit averages under 60 seconds in production.
            {' '}
          </span>
        ))}
      </p>
    </ScrollArea>
  ),
}
