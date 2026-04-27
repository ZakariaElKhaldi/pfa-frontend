import type { Meta, StoryObj } from '@storybook/react-vite'
import { TradeHistoryTable } from './TradeHistoryTable'
import type { Trade } from './TradeHistoryTable'

const trades: Trade[] = [
  { id: 1, symbol: 'AAPL', side: 'buy',  quantity: 50,  price: 175.20, executedAt: '2h ago'  },
  { id: 2, symbol: 'NVDA', side: 'buy',  quantity: 20,  price: 720.00, executedAt: '4h ago'  },
  { id: 3, symbol: 'META', side: 'sell', quantity: 10,  price: 510.80, executedAt: '1d ago'  },
  { id: 4, symbol: 'TSLA', side: 'buy',  quantity: 30,  price: 220.00, executedAt: '2d ago'  },
  { id: 5, symbol: 'GOOG', side: 'sell', quantity: 5,   price: 178.60, executedAt: '3d ago'  },
]

const meta: Meta<typeof TradeHistoryTable> = {
  title: 'Portfolio/TradeHistoryTable',
  component: TradeHistoryTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Trade history table. Maps `GET /api/portfolio/trades/`. Buy/sell side displayed with SentimentBadge (bullish/bearish) for quick visual scanning.',
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof TradeHistoryTable>

export const WithTrades: Story = {
  args: { trades },
}

export const Empty: Story = {
  args: { trades: [] },
}
