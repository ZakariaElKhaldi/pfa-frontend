import type { Meta, StoryObj } from '@storybook/react-vite'
import { TickerAccuracyTable } from './TickerAccuracyTable'
import type { TickerAccuracyRow } from './TickerAccuracyTable'

const meta: Meta<typeof TickerAccuracyTable> = {
  title: 'Admin/TickerAccuracyTable',
  component: TickerAccuracyTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Sortable per-ticker accuracy leaderboard. ' +
          'Caller aggregates `SignalAccuracy[]` from `GET /api/tickers/<symbol>/signal/accuracy/` ' +
          'across all tickers and passes as flat rows. ' +
          'Traffic-light accuracy badges: green ≥70%, amber 55–69%, red <55%. ' +
          'Null means no evaluated records exist for that ticker.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 680, padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof TickerAccuracyTable>

const rows: TickerAccuracyRow[] = [
  { symbol: 'AAPL',  accuracy1h: 0.74, accuracy24h: 0.68, signalCount: 342, bestSignal: 'BUY'  },
  { symbol: 'MSFT',  accuracy1h: 0.71, accuracy24h: 0.65, signalCount: 298, bestSignal: 'BUY'  },
  { symbol: 'NVDA',  accuracy1h: 0.68, accuracy24h: 0.61, signalCount: 415, bestSignal: 'SELL' },
  { symbol: 'TSLA',  accuracy1h: 0.54, accuracy24h: 0.49, signalCount: 512, bestSignal: 'HOLD' },
  { symbol: 'GME',   accuracy1h: 0.42, accuracy24h: 0.38, signalCount: 187, bestSignal: 'SELL' },
  { symbol: 'AMC',   accuracy1h: 0.48, accuracy24h: 0.43, signalCount: 134, bestSignal: 'HOLD' },
  { symbol: 'META',  accuracy1h: 0.66, accuracy24h: 0.60, signalCount: 276, bestSignal: 'BUY'  },
  { symbol: 'GOOGL', accuracy1h: null, accuracy24h: null, signalCount:   0, bestSignal: null   },
]

export const Default: Story = {
  args: { rows },
  parameters: {
    docs: {
      description: {
        story: 'Full leaderboard sorted by 24h accuracy desc. Click column headers to re-sort. Null rows (GOOGL) appear at the bottom when sorted by accuracy.',
      },
    },
  },
}

export const SortedBySignalCount: Story = {
  args: { rows: [...rows].sort((a, b) => b.signalCount - a.signalCount) },
  parameters: {
    docs: { description: { story: 'Pre-sorted by signal volume — most-active tickers first.' } },
  },
}

export const HighAccuracyTickers: Story = {
  args: {
    rows: [
      { symbol: 'AAPL',  accuracy1h: 0.84, accuracy24h: 0.79, signalCount: 512, bestSignal: 'BUY'  },
      { symbol: 'MSFT',  accuracy1h: 0.81, accuracy24h: 0.77, signalCount: 489, bestSignal: 'BUY'  },
      { symbol: 'NVDA',  accuracy1h: 0.78, accuracy24h: 0.73, signalCount: 601, bestSignal: 'SELL' },
    ],
  },
  parameters: {
    docs: { description: { story: 'All tickers in green — well-trained model on liquid large-caps.' } },
  },
}

export const Empty: Story = {
  args: { rows: [] },
  parameters: {
    docs: { description: { story: 'Empty state before any signals are evaluated.' } },
  },
}
