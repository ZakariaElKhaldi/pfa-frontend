import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { TickerSearch } from '@/components/common/TickerSearch'
import { WatchlistStarButton } from '@/components/common/WatchlistStarButton'
import { DataTable, type Column } from '@/components/common/DataTable'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface TickerItem { symbol: string; name: string; created_at: string }
interface WatchlistItem { symbol: string; name: string; added_at: string }

export function TickersPage() {
  const navigate  = useNavigate()
  const [query, setQuery] = useState('')
  const path = `/api/tickers/${query ? `?search=${encodeURIComponent(query)}` : ''}`
  const { state: tickers, refetch: refetchTickers } = useData<TickerItem[]>(path, [query])
  const { state: watchlist, refetch: refetchWatchlist } = useData<WatchlistItem[]>('/api/watchlist/')
  const [toggling, setToggling] = useState<Set<string>>(new Set())

  const watchSet = new Set((watchlist.status === 'success' ? watchlist.data : []).map(w => w.symbol))

  const handleToggle = useCallback(async (symbol: string, add: boolean) => {
    setToggling(s => new Set(s).add(symbol))
    try {
      if (add) {
        await api.post('/api/watchlist/', { symbol })
        toast.success(`${symbol} added to watchlist`)
      } else {
        await api.delete(`/api/watchlist/${symbol}/`)
        toast.success(`${symbol} removed from watchlist`)
      }
      refetchWatchlist()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Watchlist update failed')
    } finally {
      setToggling(s => { const n = new Set(s); n.delete(symbol); return n })
    }
  }, [refetchWatchlist])

  const columns: Column<TickerItem>[] = [
    {
      key: 'symbol',
      header: 'Symbol',
      render: row => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--on-surface)' }}>
          {row.symbol}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: row => <span style={{ color: 'var(--on-surface-muted)' }}>{row.name}</span>,
    },
    {
      key: 'watchlist',
      header: '',
      align: 'right',
      render: row => (
        <WatchlistStarButton
          symbol={row.symbol}
          active={watchSet.has(row.symbol)}
          onToggle={handleToggle}
          loading={toggling.has(row.symbol)}
          size="sm"
        />
      ),
    },
  ]

  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Market" subtitle="Browse and search all tracked instruments." />

      <TickerSearch
        results={tickers.status === 'success' ? tickers.data.map(t => ({ symbol: t.symbol, name: t.name })) : []}
        loading={tickers.status === 'loading'}
        onSearch={setQuery}
        onSelect={t => navigate(`/tickers/${t.symbol}`)}
      />

      {tickers.status === 'error' && (
        <ErrorState message={tickers.message} onRetry={refetchTickers} />
      )}

      <DataTable
        columns={columns}
        data={tickers.status === 'success' ? tickers.data : []}
        keyFn={r => r.symbol}
        loading={tickers.status === 'loading' || tickers.status === 'idle'}
        emptyText="No tickers found"
      />
    </div>
  )
}

export interface TickersPagePreviewProps {
  tickers?: TickerItem[]
  watchlist?: string[]
}

export function TickersPagePreview({
  tickers = [
    { symbol: 'AAPL', name: 'Apple Inc.', created_at: '' },
    { symbol: 'TSLA', name: 'Tesla Inc.', created_at: '' },
    { symbol: 'NVDA', name: 'Nvidia Corp.', created_at: '' },
    { symbol: 'AMZN', name: 'Amazon.com', created_at: '' },
  ],
  watchlist = ['AAPL', 'NVDA'],
}: TickersPagePreviewProps) {
  const watchSet = new Set(watchlist)
  const columns: Column<TickerItem>[] = [
    { key: 'symbol', header: 'Symbol', render: r => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{r.symbol}</span> },
    { key: 'name', header: 'Name', render: r => <span style={{ color: 'var(--on-surface-muted)' }}>{r.name}</span> },
    { key: 'watchlist', header: '', align: 'right', render: r => <WatchlistStarButton symbol={r.symbol} active={watchSet.has(r.symbol)} onToggle={() => {}} size="sm" /> },
  ]
  return (
    <div className="p-6 stack stack-5">
      <PageHeader title="Market" subtitle="Browse and search all tracked instruments." />
      <TickerSearch results={tickers.map(t => ({ symbol: t.symbol, name: t.name }))} onSearch={() => {}} onSelect={() => {}} />
      <DataTable columns={columns} data={tickers} keyFn={r => r.symbol} emptyText="No tickers found" />
    </div>
  )
}
