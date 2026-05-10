import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/layout/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { PredictionMethodBadge, SectionLabel, SignalBadge, SentimentBadge } from '@/components/design-system'
import { MetricCard } from '@/components/cards/MetricCard'
import { TickerUniverseTable, type TickerUniverseRow } from '@/components/cards/TickerUniverseTable'
import { useData } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface TickerItem {
  symbol: string
  name: string
  sector?: string
  created_at: string
}
interface WatchlistItem { symbol: string; name: string; added_at: string }
interface SignalItem {
  ticker_symbol: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  bullish_ratio: number
  sentiment: number
  post_count: number
  prediction_confidence?: number | null
  prediction_method?: string
  created_at: string
}

const ALL_SECTORS = 'All sectors'

function ageLabel(iso?: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return '—'
  const minutes = Math.max(0, Math.floor(diff / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function sentimentTone(value: number): 'bullish' | 'bearish' | 'neutral' {
  if (value > 0.2) return 'bullish'
  if (value < -0.2) return 'bearish'
  return 'neutral'
}

function confidencePct(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return `${Math.round(value * 100)}%`
}

export function TickersPage() {
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState(ALL_SECTORS)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [toggling, setToggling] = useState<Set<string>>(new Set())

  const searchPath = `/api/tickers/${query ? `?search=${encodeURIComponent(query)}` : ''}`
  const { state: tickers, refetch: refetchTickers } = useData<TickerItem[]>(searchPath, [query])
  const { state: watchlist, refetch: refetchWatchlist } = useData<WatchlistItem[]>('/api/watchlist/')
  const { state: signals } = useData<SignalItem[]>('/api/signals/recent/?limit=100&all=true')

  const watchSet = useMemo(
    () => new Set((watchlist.status === 'success' ? watchlist.data : []).map(w => w.symbol)),
    [watchlist],
  )

  const signalMap = useMemo(() => {
    if (signals.status !== 'success') return new Map<string, SignalItem>()
    return new Map(signals.data.map(s => [s.ticker_symbol, s]))
  }, [signals])

  const sectors = useMemo(() => {
    if (tickers.status !== 'success') return [ALL_SECTORS]
    const values = new Set<string>()
    tickers.data.forEach(t => { if (t.sector) values.add(t.sector) })
    return [ALL_SECTORS, ...Array.from(values).sort()]
  }, [tickers])

  const rows = useMemo<TickerUniverseRow[]>(() => {
    if (tickers.status !== 'success') return []
    const filtered = sector === ALL_SECTORS
      ? tickers.data
      : tickers.data.filter(t => t.sector === sector)
    return filtered.map(t => {
      const sig = signalMap.get(t.symbol)
      return {
        symbol: t.symbol,
        name: t.name,
        sector: t.sector,
        signal: sig?.signal,
        sentiment: sig?.sentiment,
        bullishRatio: sig?.bullish_ratio,
        confidence: sig?.prediction_confidence ?? null,
        predictionMethod: sig?.prediction_method,
        postCount: sig?.post_count,
        updatedAt: sig?.created_at,
      }
    })
  }, [tickers, sector, signalMap])

  useEffect(() => {
    if (rows.length === 0) {
      setSelectedSymbol(null)
      return
    }
    if (!selectedSymbol || !rows.some(r => r.symbol === selectedSymbol)) {
      setSelectedSymbol(rows[0].symbol)
    }
  }, [rows, selectedSymbol])

  const selectedRow = selectedSymbol ? rows.find(r => r.symbol === selectedSymbol) ?? null : null
  const selectedSignal = selectedRow ? signalMap.get(selectedRow.symbol) : undefined

  const summary = useMemo(() => {
    if (signals.status !== 'success') return null
    const counts = { BUY: 0, SELL: 0, HOLD: 0 }
    let confidenceSum = 0
    let confidenceCount = 0
    signals.data.forEach(s => {
      counts[s.signal] += 1
      if (typeof s.prediction_confidence === 'number') {
        confidenceSum += s.prediction_confidence
        confidenceCount += 1
      }
    })
    return {
      counts,
      total: signals.data.length,
      avgConfidence: confidenceCount ? confidenceSum / confidenceCount : null,
    }
  }, [signals])

  const handleToggle = useCallback(async (symbol: string, add: boolean) => {
    setToggling(prev => new Set(prev).add(symbol))
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
      setToggling(prev => {
        const next = new Set(prev)
        next.delete(symbol)
        return next
      })
    }
  }, [refetchWatchlist])

  return (
    <div className="p-6 stack stack-6">
      <PageHeader
        title="Tickers"
        subtitle="Screen the market universe with live signal context and watchlist status."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Universe"
          value={tickers.status === 'success' ? String(tickers.data.length) : '—'}
          delta="Tracked instruments"
          positive
        />
        <MetricCard
          label="Watchlist"
          value={watchlist.status === 'success' ? String(watchlist.data.length) : '—'}
          delta="Saved symbols"
          positive
        />
        <MetricCard
          label="Recent signals"
          value={summary ? String(summary.total) : '—'}
          delta={summary ? `${summary.counts.BUY} buy · ${summary.counts.SELL} sell · ${summary.counts.HOLD} hold` : 'No signal data'}
          positive
        />
        <MetricCard
          label="Avg confidence"
          value={summary?.avgConfidence !== null && summary?.avgConfidence !== undefined ? confidencePct(summary.avgConfidence) : '—'}
          delta="Across loaded signals"
          positive
        />
      </div>

      <div className="card stack stack-4 p-4 md:p-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="stack stack-1">
            <SectionLabel>Market filter</SectionLabel>
            <div className="text-body-sm text-muted">Search by symbol or company and narrow by sector.</div>
          </div>
          <div className="text-label-sm text-muted tabular-nums">
            {tickers.status === 'success' ? `${rows.length} shown` : 'Loading…'}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_1fr]">
          <input
            type="search"
            placeholder="Search ticker or company…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-body-md outline-none transition-colors focus:border-primary"
          />
          <div className="flex flex-wrap gap-2">
            {sectors.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setSector(item)}
                className={`btn btn-sm ${sector === item ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '999px' }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tickers.status === 'error' && <ErrorState message={tickers.message} onRetry={refetchTickers} />}
      {(tickers.status === 'loading' || tickers.status === 'idle') && (
        <div className="stack stack-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
        </div>
      )}

      {tickers.status === 'success' && rows.length > 0 && (
        <TickerUniverseTable
          rows={rows}
          selectedSymbol={selectedSymbol}
          onSelect={setSelectedSymbol}
          watchSet={watchSet}
          toggling={toggling}
          onToggleWatchlist={handleToggle}
        />
      )}

      {selectedRow && (
        <div className="card stack stack-4 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="stack stack-1">
              <SectionLabel>Selected ticker</SectionLabel>
              <div className="cluster cluster-2" style={{ alignItems: 'baseline' }}>
                <h2 className="text-headline-sm">{selectedRow.symbol}</h2>
                <span className="text-body-sm text-muted">{selectedRow.name}</span>
              </div>
            </div>
            <div className="text-label-sm text-muted">Updated {selectedSignal?.created_at ? ageLabel(selectedSignal.created_at) : '—'}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedSignal?.signal && <SignalBadge signal={selectedSignal.signal} />}
            {selectedSignal && <SentimentBadge label={sentimentTone(selectedSignal.sentiment)} />}
            <PredictionMethodBadge method={selectedSignal?.prediction_method ?? 'rule_based'} />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="metric-card">
              <span className="metric-card-label">Sector</span>
              <span className="metric-card-value">{selectedRow.sector ?? '—'}</span>
            </div>
            <div className="metric-card">
              <span className="metric-card-label">Posts</span>
              <span className="metric-card-value">{selectedSignal?.post_count ?? '—'}</span>
            </div>
            <div className="metric-card">
              <span className="metric-card-label">Confidence</span>
              <span className="metric-card-value">{confidencePct(selectedSignal?.prediction_confidence)}</span>
            </div>
            <div className="metric-card">
              <span className="metric-card-label">Sentiment</span>
              <span className="metric-card-value">
                {selectedSignal ? selectedSignal.sentiment.toFixed(2) : '—'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => selectedSymbol && handleToggle(selectedSymbol, !watchSet.has(selectedSymbol))}
              className="btn btn-ghost"
            >
              {selectedSymbol && watchSet.has(selectedSymbol) ? 'Remove watchlist' : 'Add to watchlist'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
