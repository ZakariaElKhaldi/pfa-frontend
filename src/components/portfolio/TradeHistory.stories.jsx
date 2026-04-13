import TradeHistory from '@/components/portfolio/TradeHistory'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/* Mock the useTrades hook with msw or by injecting data directly via QueryClient */
function withTrades(trades) {
  return (Story) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    /* Pre-seed TanStack Query cache so the hook returns data immediately */
    qc.setQueryData(['portfolio', 'trades'], trades)
    return (
      <QueryClientProvider client={qc}>
        <div className="max-w-3xl">
          <Story />
        </div>
      </QueryClientProvider>
    )
  }
}

export default {
  title: 'Portfolio/TradeHistory',
  component: TradeHistory,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

const trades = [
  { id: 1, ticker: 'NVDA', side: 'BUY',  quantity: 10, price: 882.41, executed_at: new Date(Date.now() - 2 * 60 * 60_000).toISOString() },
  { id: 2, ticker: 'TSLA', side: 'SELL', quantity: 5,  price: 248.10, executed_at: new Date(Date.now() - 6 * 60 * 60_000).toISOString() },
  { id: 3, ticker: 'AAPL', side: 'BUY',  quantity: 20, price: 182.40, executed_at: new Date(Date.now() - 24 * 60 * 60_000).toISOString() },
  { id: 4, ticker: 'SPY',  side: 'BUY',  quantity: 3,  price: 540.25, executed_at: new Date(Date.now() - 48 * 60 * 60_000).toISOString() },
  { id: 5, ticker: 'GME',  side: 'SELL', quantity: 50, price: 14.82,  executed_at: new Date(Date.now() - 72 * 60 * 60_000).toISOString() },
]

export const WithTrades = {
  decorators: [withTrades(trades)],
}

export const Empty = {
  decorators: [withTrades([])],
}

export const Loading = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <div className="max-w-3xl"><Story /></div>
      </QueryClientProvider>
    ),
  ],
}
