import type { Meta, StoryObj } from '@storybook/react-vite'
import { SignalHistoryTable } from './SignalHistoryTable'
import type { SignalHistoryRow } from './SignalHistoryTable'

const rows: SignalHistoryRow[] = [
  { id: 1, createdAt: '2m ago',  signal: 'BUY',  sentiment: 'bullish', postCount: 312, bullishRatio: 0.81, normalizedIndex: 0.743, predictionMethod: 'ml',         predictionConfidence: 0.87 },
  { id: 2, createdAt: '17m ago', signal: 'HOLD', sentiment: 'neutral', postCount: 198, bullishRatio: 0.52, normalizedIndex: 0.048, predictionMethod: 'rule_based',  predictionConfidence: 0.64 },
  { id: 3, createdAt: '32m ago', signal: 'SELL', sentiment: 'bearish', postCount: 447, bullishRatio: 0.22, normalizedIndex: -0.612, predictionMethod: 'ml',        predictionConfidence: 0.91 },
  { id: 4, createdAt: '1h ago',  signal: 'BUY',  sentiment: 'bullish', postCount: 280, bullishRatio: 0.74, normalizedIndex: 0.582, predictionMethod: 'ml',         predictionConfidence: 0.79 },
]

const meta: Meta<typeof SignalHistoryTable> = {
  title: 'Signals/SignalHistoryTable',
  component: SignalHistoryTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Signal snapshot history table for a ticker. Maps `GET /api/tickers/:symbol/signal/history/`. Columns cover all diagnostic fields of the `SignalSnapshot` model.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof SignalHistoryTable>

export const WithHistory: Story = { args: { rows } }
export const Empty:       Story = { args: { rows: [] } }
