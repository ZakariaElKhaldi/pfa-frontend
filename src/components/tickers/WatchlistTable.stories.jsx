import { useState } from 'react'
import WatchlistTable from '@/components/tickers/WatchlistTable'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function withWatchlist(items) {
  return (Story) => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(['watchlist'], items)
    /* Pre-seed quote data so price column shows */
    items.forEach((it) => {
      qc.setQueryData(['market', 'quote', it.symbol], {
        price:      it._price ?? 100.00,
        change_pct: it._change ?? 0.5,
      })
      qc.setQueryData(['signals', 'latest', it.symbol], {
        signal:                  it._signal ?? 'HOLD',
        prediction_confidence:   0.75,
      })
    })
    return (
      <QueryClientProvider client={qc}>
        <div className="max-w-3xl p-4">
          <Story />
        </div>
      </QueryClientProvider>
    )
  }
}

export default {
  title: 'Market/WatchlistTable',
  component: WatchlistTable,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
}

const items = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', added_at: new Date(Date.now() - 86400_000).toISOString(), _price: 882.41, _change:  3.5, _signal: 'STRONG_BUY' },
  { symbol: 'TSLA', name: 'Tesla, Inc.',         added_at: new Date(Date.now() - 48*3600_000).toISOString(), _price: 248.10, _change: -1.2, _signal: 'SELL' },
  { symbol: 'AAPL', name: 'Apple Inc.',          added_at: new Date(Date.now() - 72*3600_000).toISOString(), _price: 182.40, _change:  0.0, _signal: 'HOLD' },
  { symbol: 'MSFT', name: 'Microsoft Corp.',     added_at: new Date(Date.now() - 96*3600_000).toISOString(), _price: 415.00, _change:  1.8, _signal: 'BUY' },
]

export const Populated = {
  decorators: [withWatchlist(items)],
}

export const Empty = {
  decorators: [withWatchlist([])],
}
